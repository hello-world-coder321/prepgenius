const express = require('express');
const router = express.Router();
const StudyPlan = require('../models/StudyPlan');
const Progress = require('../models/Progress');
const Revision = require('../models/Revision');
const User = require('../models/User');
const { requireAuth } = require('./auth');

const EXAM_SUBJECTS = {
  JEE: ['Physics', 'Chemistry', 'Mathematics'],
  NEET: ['Physics', 'Chemistry', 'Biology'],
  UPSC: ['General Studies', 'CSAT', 'Optional Subject'],
};

// ── Planner Page ──
router.get('/', requireAuth, async (req, res) => {
  if (!req.session.user.selectedExam) return res.redirect('/exam-select');

  const today = new Date().toISOString().split('T')[0];
  const plan = await StudyPlan.findOne({ userId: req.session.user.id, date: today });

  res.render('planner', {
    exam: req.session.user.selectedExam,
    plan: plan || null,
    today,
  });
});

// ── Generate Study Plan ──
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const grokAI = req.app.locals.grokAI;
    const userId = req.session.user.id;
    const exam = req.session.user.selectedExam;
    const subjects = EXAM_SUBJECTS[exam] || [];
    const user = await User.findById(userId);
    const targetYear = user?.targetYear || new Date().getFullYear() + 1;

    // Get progress data for context
    const progressData = await Progress.find({ userId });
    const dueRevisions = await Revision.find({
      userId,
      nextReviewDate: { $lte: new Date() },
    });

    // Build context about weak areas
    const weakTopics = progressData
      .filter(p => p.masteryPercent < 50)
      .map(p => `${p.topic} (${p.subject}, ${p.masteryPercent}% mastery)`)
      .slice(0, 10);

    const dueTopics = dueRevisions
      .map(r => `${r.topic} (${r.subject})`)
      .slice(0, 5);

    const today = new Date().toISOString().split('T')[0];
    const examDate = `${targetYear}-05-01`; // approximate exam date
    const daysToExam = Math.max(1, Math.floor((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)));

    if (!grokAI || !grokAI.isConfigured()) {
      // Fallback plan
      const fallbackTasks = generateFallbackPlan(subjects, dueRevisions);
      let plan = await StudyPlan.findOne({ userId, date: today });
      if (plan) {
        plan.tasks = fallbackTasks;
        plan.totalMinutes = fallbackTasks.reduce((s, t) => s + t.duration, 0);
        plan.completedMinutes = 0;
        plan.generatedAt = new Date();
      } else {
        plan = new StudyPlan({
          userId, date: today, exam, tasks: fallbackTasks,
          totalMinutes: fallbackTasks.reduce((s, t) => s + t.duration, 0),
        });
      }
      await plan.save();
      return res.json({ plan });
    }

    const systemPrompt = `You are an expert ${exam} study planner AI. Generate a focused daily study plan. Return ONLY valid JSON array, no other text.`;

    const userPrompt = `Create a study plan for today for a student preparing for ${exam} (target: ${targetYear}, ${daysToExam} days left).

Subjects: ${subjects.join(', ')}

Weak areas needing focus:
${weakTopics.length > 0 ? weakTopics.join('\n') : 'No data yet — create a balanced plan.'}

Topics due for spaced repetition review:
${dueTopics.length > 0 ? dueTopics.join('\n') : 'None due today.'}

Generate 6-8 study tasks. Return ONLY a valid JSON array:
[
  {
    "subject": "Physics",
    "topic": "Specific topic name",
    "type": "study|revision|quiz|practice|break",
    "duration": 45,
    "priority": "high|medium|low",
    "notes": "Brief note about what to focus on"
  }
]

Rules:
- Include at least 1 revision task if there are due topics
- Include 1-2 breaks of 10-15 min
- Total study time should be 4-6 hours
- Prioritize weak areas
- Mix subjects for variety`;

    const responseText = await grokAI.chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.7 });

    let tasks;
    try {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      tasks = JSON.parse(cleaned);
    } catch {
      tasks = generateFallbackPlan(subjects, dueRevisions);
    }

    // Save to DB (upsert)
    let plan = await StudyPlan.findOne({ userId, date: today });
    if (plan) {
      plan.tasks = tasks;
      plan.totalMinutes = tasks.reduce((s, t) => s + (t.duration || 0), 0);
      plan.completedMinutes = 0;
      plan.generatedAt = new Date();
    } else {
      plan = new StudyPlan({
        userId, date: today, exam, tasks,
        totalMinutes: tasks.reduce((s, t) => s + (t.duration || 0), 0),
      });
    }
    await plan.save();

    res.json({ plan });
  } catch (err) {
    console.error('Planner Generate Error:', err);
    res.status(500).json({ error: 'Failed to generate study plan.' });
  }
});

// ── Toggle Task Completion ──
router.post('/toggle', requireAuth, async (req, res) => {
  try {
    const { taskIndex } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const plan = await StudyPlan.findOne({ userId: req.session.user.id, date: today });
    if (!plan || !plan.tasks[taskIndex]) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    plan.tasks[taskIndex].completed = !plan.tasks[taskIndex].completed;
    plan.completedMinutes = plan.tasks
      .filter(t => t.completed)
      .reduce((s, t) => s + (t.duration || 0), 0);
    await plan.save();

    res.json({ success: true, completed: plan.tasks[taskIndex].completed, completedMinutes: plan.completedMinutes });
  } catch (err) {
    console.error('Toggle Task Error:', err);
    res.status(500).json({ error: 'Failed to toggle task.' });
  }
});

// ── Get Today's Plan (API) ──
router.get('/today', requireAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const plan = await StudyPlan.findOne({ userId: req.session.user.id, date: today });
    res.json({ plan: plan || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load plan.' });
  }
});

function generateFallbackPlan(subjects, dueRevisions) {
  const tasks = [];

  subjects.forEach((subject, i) => {
    tasks.push({
      subject,
      topic: `Core concepts review`,
      type: 'study',
      duration: 45,
      priority: i === 0 ? 'high' : 'medium',
      notes: 'Focus on fundamentals',
    });
  });

  if (dueRevisions.length > 0) {
    dueRevisions.slice(0, 2).forEach(rev => {
      tasks.push({
        subject: rev.subject,
        topic: rev.topic,
        type: 'revision',
        duration: 30,
        priority: 'high',
        notes: 'Spaced repetition review',
      });
    });
  }

  tasks.push({
    subject: 'Break',
    topic: 'Rest & Refresh',
    type: 'break',
    duration: 15,
    priority: 'low',
    notes: 'Take a short walk or stretch',
  });

  tasks.push({
    subject: subjects[0] || 'General',
    topic: 'Practice problems',
    type: 'quiz',
    duration: 30,
    priority: 'medium',
    notes: 'Test your understanding with a quick quiz',
  });

  return tasks;
}

module.exports = router;
