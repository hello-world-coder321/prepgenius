const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('./auth');
const Document = require('../models/Document');
const vectorStore = require('../services/vectorStore');

// ── Study Suite Page ──
router.get('/', requireAuth, (req, res) => {
  if (!req.session.user.selectedExam) return res.redirect('/exam-select');
  res.render('study-suite', { exam: req.session.user.selectedExam });
});

// ── Upload PDF / Image ──
router.post('/upload', requireAuth, (req, res) => {
  const upload = req.app.locals.upload;
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
      let extractedText = '';

      if (req.file.mimetype === 'application/pdf') {
        try {
          const pdfParse = require('pdf-parse');
          const pdfBuffer = fs.readFileSync(req.file.path);
          const pdfData = await pdfParse(pdfBuffer);
          extractedText = pdfData.text;
        } catch (err) {
          console.error('PDF Parse Error:', err);
          extractedText = 'PDF text extraction failed. The file may be password-protected.';
        }
      }

      // Save document record to MongoDB
      const doc = await Document.create({
        userId: req.session.user.id,
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        extractedText: extractedText,
      });

      // Index in vector store for RAG (async, don't block response)
      if (extractedText.length > 30) {
        vectorStore.addDocument(req.session.user.id, doc._id.toString(), extractedText);
        console.log(`📊 Indexed document ${doc.originalName} for RAG`);
      }

      res.json({
        _id: doc._id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        extractedText: extractedText,
        message: 'File uploaded successfully!',
      });
    } catch (uploadErr) {
      console.error('Upload error:', uploadErr);
      res.status(500).json({ error: 'Upload processing failed.' });
    }
  });
});

// ── List User's Documents ──
router.get('/documents', requireAuth, async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.session.user.id })
      .select('originalName mimetype size uploadedAt')
      .sort({ uploadedAt: -1 })
      .limit(50);
    res.json(docs);
  } catch (err) {
    console.error('List Documents Error:', err);
    res.status(500).json({ error: 'Failed to load documents.' });
  }
});

// ── Get Single Document (with extracted text) ──
router.get('/documents/:id', requireAuth, async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      userId: req.session.user.id,
    });
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    res.json(doc);
  } catch (err) {
    console.error('Get Document Error:', err);
    res.status(500).json({ error: 'Failed to load document.' });
  }
});

// ── Delete Document ──
router.delete('/documents/:id', requireAuth, async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.user.id,
    });
    if (!doc) return res.status(404).json({ error: 'Document not found.' });

    // Delete file from disk
    const filePath = path.join(__dirname, '..', 'uploads', doc.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from vector store
    vectorStore.removeDocument(req.session.user.id, doc._id.toString());

    res.json({ success: true, message: 'Document deleted.' });
  } catch (err) {
    console.error('Delete Document Error:', err);
    res.status(500).json({ error: 'Failed to delete document.' });
  }
});

// ── Summarize ──
router.post('/summarize', requireAuth, async (req, res) => {
  try {
    const { text, mode } = req.body;
    const grokAI = req.app.locals.grokAI;

    if (!grokAI || !grokAI.isConfigured()) {
      return res.json({ summary: 'AI not configured. Add GROK_API_KEY to .env for summaries.' });
    }

    const prompts = {
      executive: `Create a concise executive summary of the following text. Highlight key points, main arguments, and conclusions. Use bullet points for clarity.`,
      conceptmap: `Create a concept map summary of the following text. Show the main concepts and their relationships using a hierarchical structure with arrows (→) showing connections. Format it clearly.`,
      qna: `Convert the following text into a Q&A format. Generate 5-8 important questions and their detailed answers based on the content.`,
    };

    const systemPrompt = prompts[mode] || prompts.executive;

    const summary = await grokAI.chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ]);

    res.json({ summary });
  } catch (err) {
    console.error('Summarize Error:', err);
    res.status(500).json({ error: 'Summary generation failed.' });
  }
});

// ── Doubt with Hint-First Logic + RAG Context ──
router.post('/doubt', requireAuth, async (req, res) => {
  try {
    const { question, getHint } = req.body;
    const grokAI = req.app.locals.grokAI;
    const exam = req.session.user.selectedExam;

    if (!grokAI || !grokAI.isConfigured()) {
      return res.json({ answer: 'AI not configured. Add GROK_API_KEY to .env for doubt solving.' });
    }

    // RAG: search user's documents for relevant context
    let ragContext = '';
    try {
      const relevantChunks = await vectorStore.searchSimilar(req.session.user.id, question, 3);
      if (relevantChunks.length > 0) {
        ragContext = '\n\nRelevant context from the student\'s study materials:\n' +
          relevantChunks.map((c, i) => `[Source ${i + 1}]: ${c.text}`).join('\n');
      }
    } catch (err) {
      console.error('RAG search error:', err.message);
    }

    let systemPrompt, userPrompt;
    if (getHint) {
      systemPrompt = `You are an expert ${exam} tutor. Give ONLY a conceptual hint (2-3 sentences) that guides the student toward understanding without revealing the full solution. Start with "💡 Hint:"`;
      userPrompt = `The student has this doubt: "${question}"${ragContext}`;
    } else {
      systemPrompt = `You are an expert ${exam} tutor. Explain doubts clearly with step-by-step solutions. Use markdown formatting. Include relevant formulas, diagram descriptions, and examples.${ragContext ? ' Reference the student\'s study materials where applicable.' : ''}`;
      userPrompt = `Explain this doubt clearly: "${question}"${ragContext}`;
    }

    const answer = await grokAI.chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
    res.json({ answer });
  } catch (err) {
    console.error('Doubt Error:', err);
    res.status(500).json({ error: 'Doubt resolution failed.' });
  }
});

// ── Serve uploaded files ──
router.get('/file/:filename', requireAuth, (req, res) => {
  const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found.' });
  }
});

module.exports = router;
