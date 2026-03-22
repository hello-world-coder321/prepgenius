const express = require('express');
const router = express.Router();
const { requireAuth } = require('./auth');

/**
 * Extract YouTube video ID from URL
 */
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Fetch transcript using youtube-transcript package
 */
async function fetchTranscript(videoId) {
  try {
    const { YoutubeTranscript } = require('../services/youtubeTranscript');
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map(t => t.text).join(' ');
  } catch (err) {
    console.error('Transcript fetch error:', err.message);
    return null;
  }
}

// ── Process YouTube Video ──
router.post('/process', requireAuth, async (req, res) => {
  try {
    const { url } = req.body;
    const grokAI = req.app.locals.grokAI;

    if (!url) {
      return res.status(400).json({ error: 'Please provide a YouTube URL.' });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL. Please use a valid link.' });
    }

    // Fetch transcript
    const transcript = await fetchTranscript(videoId);
    if (!transcript || transcript.length < 50) {
      return res.status(400).json({ error: 'Could not fetch transcript. The video may not have captions available.' });
    }

    if (!grokAI || !grokAI.isConfigured()) {
      return res.json({
        videoId,
        notes: `**Transcript extracted** (${transcript.length} chars). Configure GROK_API_KEY for AI-generated notes.\n\n---\n\n${transcript.substring(0, 2000)}...`,
      });
    }

    const exam = req.session.user.selectedExam || 'general';

    const systemPrompt = `You are an expert ${exam} educator. You convert video transcripts into structured, exam-focused study notes. Use markdown formatting with headers, bullet points, key formulas, and concept highlights.`;

    const userPrompt = `Convert this educational video transcript into structured visual study notes. Include:
1. **📋 Summary** (2-3 sentences overview)
2. **🔑 Key Concepts** (bullet points of main ideas)
3. **📐 Important Formulas/Facts** (if applicable)
4. **🗺️ Concept Map** (show relationships between concepts using arrows →)
5. **❓ Quick Revision Questions** (3-5 questions to test understanding)

Transcript:
${transcript.substring(0, 6000)}`;

    const notes = await grokAI.chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.5 });

    res.json({ videoId, notes, transcriptLength: transcript.length });
  } catch (err) {
    console.error('YouTube Process Error:', err);
    res.status(500).json({ error: 'Failed to process video: ' + (err.message || 'Unknown error') });
  }
});

module.exports = router;
