const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const ReviewLog = require('../models/ReviewLog');
const { sm2, retentionPercent, urgency } = require('../services/sm2');
const { requireAuth } = require('./auth');

function requireAuthAPI(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
  next();
}

// GET /srs/topics — all topics with live retention
router.get('/topics', requireAuthAPI, async (req, res) => {
  try {
    const topics = await Topic.find({ userId: req.session.user.id })
      .populate('prerequisites', 'name subject');
    const enriched = topics.map(t => ({
      ...t.toJSON(),
      retention: retentionPercent(t),
      urgency: urgency(t),
      daysUntilDue: Math.max(0, Math.round((new Date(t.nextDue) - Date.now()) / 86400000))
    }));
    res.json(enriched);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /srs/due — only topics due today
router.get('/due', requireAuthAPI, async (req, res) => {
  try {
    const topics = await Topic.find({
      userId: req.session.user.id,          // ← was req.session.userId
      nextDue: { $lte: new Date() }
    }).sort({ nextDue: 1 });
    res.json(topics.map(t => ({
      ...t.toJSON(),
      retention: retentionPercent(t),
      urgency: urgency(t)
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /srs/review — submit a recall rating (0–5)
router.post('/review', requireAuthAPI, async (req, res) => {
  try {
    const { topicId, quality } = req.body;
    if (quality === undefined || !topicId) return res.status(400).json({ error: 'Missing fields' });

    const topic = await Topic.findOne({ _id: topicId, userId: req.session.user.id }); // ← fixed
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    const updated = sm2(topic, Number(quality));
    Object.assign(topic, updated);
    await topic.save();

    await ReviewLog.create({
      userId: req.session.user.id,           // ← was req.session.userId
      topicId,
      quality: Number(quality),
      retention: retentionPercent(topic),
      interval: topic.interval
    });

    res.json({ ...topic.toJSON(), retention: retentionPercent(topic), urgency: urgency(topic) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /srs/topics — add a new topic
router.post('/topics', requireAuthAPI, async (req, res) => {
  try {
    const { name, subject, chapter, exam, prerequisites } = req.body;
    const topic = await Topic.create({
      userId: req.session.user.id,           // ← was req.session.userId
      name, subject, chapter, exam,
      prerequisites: prerequisites || []
    });
    res.json(topic);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /srs/graph — knowledge graph data (nodes + edges)
router.get('/graph', requireAuthAPI, async (req, res) => {
  try {
    const topics = await Topic.find({ userId: req.session.user.id }) // ← fixed
      .populate('prerequisites', '_id name subject chapter');
    const nodes = topics.map(t => ({
      id: t._id, name: t.name, subject: t.subject, chapter: t.chapter,
      retention: retentionPercent(t), urgency: urgency(t),
      repetitions: t.repetitions, interval: t.interval,
      lastStudied: t.lastStudied, nextDue: t.nextDue,
    }));
    const edges = [];
    topics.forEach(t => {
      t.prerequisites.forEach(p => edges.push({ from: p._id, to: t._id }));
    });
    res.json({ nodes, edges });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /srs/page — render the SRS dashboard page (browser route, redirects to /login)
router.get('/page', requireAuth, (req, res) => {
  res.render('srs', { title: 'Spaced Repetition', user: req.session.user });
});

module.exports = router;