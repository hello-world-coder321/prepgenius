const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Progress = require('../models/Progress');
const Revision = require('../models/Revision');
const { requireAuth } = require('./auth');

// ── Exam subjects mapping ──
const EXAM_SUBJECTS = {
  JEE: ['Physics', 'Chemistry', 'Mathematics'],
  NEET: ['Physics', 'Chemistry', 'Biology'],
  UPSC: ['General Studies', 'CSAT', 'Optional Subject'],
};

// ── Exam Select Page ──
router.get('/exam-select', requireAuth, (req, res) => {
  res.render('exam-select', { hideNav: true });
});

// ── Select Exam ──
router.post('/select-exam', requireAuth, async (req, res) => {
  try {
    const { exam } = req.body;
    if (!['JEE', 'NEET', 'UPSC'].includes(exam)) {
      return res.redirect('/exam-select');
    }
    await User.findByIdAndUpdate(req.session.user.id, { selectedExam: exam });
    req.session.user.selectedExam = exam;
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Exam Select Error:', err);
    res.redirect('/exam-select');
  }
});

// ── Dashboard ──
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const exam = req.session.user.selectedExam;
    if (!exam) return res.redirect('/exam-select');

    const subjects = EXAM_SUBJECTS[exam] || [];
    const progressData = await Progress.find({ userId });

    // Calculate mastery per subject
    const mastery = subjects.map(subject => {
      const topicsInSubject = progressData.filter(p => p.subject === subject);
      const avgMastery = topicsInSubject.length > 0
        ? Math.round(topicsInSubject.reduce((sum, p) => sum + p.masteryPercent, 0) / topicsInSubject.length)
        : 0;
      return { subject, mastery: avgMastery, topicCount: topicsInSubject.length };
    });

    // Due revisions
    const dueRevisions = await Revision.find({
      userId,
      nextReviewDate: { $lte: new Date() },
    });

    // Predictive rank (simple heuristic)
    const overallMastery = mastery.reduce((sum, m) => sum + m.mastery, 0) / (mastery.length || 1);
    const predictiveRank = overallMastery > 0
      ? Math.max(1, Math.round(10000 * (1 - overallMastery / 100)))
      : null;

    const user = await User.findById(userId);

    res.render('dashboard', {
      mastery,
      subjects,
      exam,
      dueRevisions,
      predictiveRank,
      targetYear: user?.targetYear || new Date().getFullYear() + 1,
    });
  } catch (err) {
    console.error('Dashboard Error:', err);
    res.redirect('/login');
  }
});

// ── Topic Strength API ──
router.get('/topic-strength', requireAuth, async (req, res) => {
  try {
    const progressData = await Progress.find({ userId: req.session.user.id });
    const grouped = { weak: [], good: [], mastered: [] };
    progressData.forEach(p => {
      grouped[p.strength].push({ subject: p.subject, topic: p.topic, mastery: p.masteryPercent });
    });
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load topic strength.' });
  }
});

// ── Update Target Year API ──
router.post('/update-target-year', requireAuth, async (req, res) => {
  try {
    const { year } = req.body;
    if (!year || isNaN(year)) return res.status(400).json({ error: 'Invalid year.' });
    await User.findByIdAndUpdate(req.session.user.id, { targetYear: parseInt(year) });
    res.json({ success: true, year: parseInt(year) });
  } catch (err) {
    console.error('Update Target Year Error:', err);
    res.status(500).json({ error: 'Failed to update target year.' });
  }
});

module.exports = router;
