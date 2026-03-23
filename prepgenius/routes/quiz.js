const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Revision = require('../models/Revision');
const { requireAuth } = require('./auth');

// ── Quiz Page ──
router.get('/page', requireAuth, (req, res) => {
  res.render('quiz');
});

// ── Generate Quiz ──
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { topic, subject } = req.body;
    const grokAI = req.app.locals.grokAI;

    if (!grokAI || !grokAI.isConfigured()) {
      return res.json({
        questions: generateFallbackQuiz(topic, subject),
        topic,
        subject,
        message: 'AI not configured — showing sample questions.',
      });
    }

    // Get user's past mistakes for this topic
    const progress = await Progress.findOne({
      userId: req.session.user.id,
      topic,
      subject,
    });

    const wrongAnswerContext = progress?.wrongAnswers?.slice(-5).map(w =>
      `Previously got wrong: "${w.question}" (answered ${w.userAnswer}, correct was ${w.correctAnswer})`
    ).join('\n') || 'No previous mistakes recorded.';

    const exam = req.session.user.selectedExam || 'general';
    const difficultyLevel = progress ? Math.min(5, Math.floor(progress.masteryPercent / 20) + 1) : 1;

    const systemPrompt = `You are a ${exam} exam question paper setter. You generate MCQ questions in valid JSON format only. No markdown, no extra text.`;

    const userPrompt = `Generate exactly 5 MCQ questions on the topic "${topic}" (Subject: ${subject}).

Difficulty Level: ${difficultyLevel}/5
Focus 40% of questions on areas where the student previously made mistakes:
${wrongAnswerContext}

IMPORTANT: Return ONLY a valid JSON array with this exact format, no other text:
[
  {
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correct": 0,
    "explanation": "Brief explanation of why this is correct.",
    "difficulty": ${difficultyLevel}
  }
]

Make sure questions are ${exam}-level appropriate. The "correct" field is the zero-based index of the correct option.`;

    const responseText = await grokAI.chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.8 });

    let questions;
    try {
      // Clean markdown code fences if present
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      questions = JSON.parse(cleaned);
    } catch {
      questions = generateFallbackQuiz(topic, subject);
    }

    res.json({ questions, topic, subject, difficultyLevel });
  } catch (err) {
    console.error('Quiz Generate Error:', err);
    res.json({
      questions: generateFallbackQuiz(req.body.topic, req.body.subject),
      topic: req.body.topic,
      subject: req.body.subject,
      message: 'Error generating quiz — showing sample questions.',
    });
  }
});

// ── Submit Quiz ──
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const { topic, subject, answers, questions } = req.body;
    const userId = req.session.user.id;

    let score = 0;
    const wrongAnswers = [];
    const results = [];

    questions.forEach((q, i) => {
      const userAnswer = answers[i];
      const isCorrect = userAnswer === q.correct;
      if (isCorrect) {
        score++;
      } else {
        wrongAnswers.push({
          question: q.question,
          userAnswer: q.options[userAnswer] || 'Not answered',
          correctAnswer: q.options[q.correct],
        });
      }
      results.push({
        question: q.question,
        correct: isCorrect,
        correctAnswer: q.options[q.correct],
        userAnswer: q.options[userAnswer] || 'Not answered',
        explanation: q.explanation,
      });
    });

    // Update Progress
    let progress = await Progress.findOne({ userId, topic, subject });
    if (!progress) {
      progress = new Progress({ userId, topic, subject });
    }
    progress.totalCorrect += score;
    progress.totalAttempted += questions.length;
    progress.masteryPercent = Math.round((progress.totalCorrect / progress.totalAttempted) * 100);
    progress.wrongAnswers.push(...wrongAnswers);
    progress.quizHistory.push({
      score,
      total: questions.length,
      difficultyLevel: questions[0]?.difficulty || 1,
    });
    await progress.save();

    // Update Revision (SM-2)
    let revision = await Revision.findOne({ userId, topic });
    if (!revision) {
      revision = new Revision({ userId, topic, subject });
    }
    const quality = Math.round((score / questions.length) * 5); // map 0-100% to 0-5
    revision.updateSM2(quality);
    await revision.save();

    res.json({ score, total: questions.length, results, mastery: progress.masteryPercent });
  } catch (err) {
    console.error('Quiz Submit Error:', err);
    res.status(500).json({ error: 'Failed to submit quiz.' });
  }
});

// ── Fallback quiz generator ──
function generateFallbackQuiz(topic, subject) {
  return [
    {
      question: `What is a fundamental concept in ${topic || subject || 'this subject'}?`,
      options: ['A) Concept Alpha', 'B) Concept Beta', 'C) Concept Gamma', 'D) Concept Delta'],
      correct: 0,
      explanation: 'This is a sample question. Connect your Grok API key for real AI-generated questions.',
      difficulty: 1,
    },
    {
      question: `Which principle governs ${topic || 'this area'}?`,
      options: ['A) First Principle', 'B) Second Principle', 'C) Third Principle', 'D) Fourth Principle'],
      correct: 1,
      explanation: 'Sample question — enable AI for personalized quizzes.',
      difficulty: 1,
    },
    {
      question: `In ${subject || 'this subject'}, what is the key formula for ${topic || 'basic calculations'}?`,
      options: ['A) Formula A', 'B) Formula B', 'C) Formula C', 'D) Formula D'],
      correct: 2,
      explanation: 'Sample question to test the quiz flow.',
      difficulty: 1,
    },
    {
      question: `What year was the ${topic || 'concept'} first introduced?`,
      options: ['A) 1900', 'B) 1920', 'C) 1942', 'D) 1960'],
      correct: 1,
      explanation: 'Historical sample question.',
      difficulty: 1,
    },
    {
      question: `Who is most associated with ${topic || 'this field'}?`,
      options: ['A) Scientist A', 'B) Scientist B', 'C) Scientist C', 'D) Scientist D'],
      correct: 0,
      explanation: 'Sample — configure Grok for real questions.',
      difficulty: 1,
    },
  ];
}

module.exports = router;
