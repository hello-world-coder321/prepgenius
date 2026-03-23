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
      .populate('prerequisites', '_id name subject chapter');
    const enriched = topics.map(t => ({
      ...t.toJSON(),
      id: String(t._id),
      prerequisites: (t.prerequisites || []).map(p =>
        typeof p === 'object' ? String(p._id) : String(p)
      ),
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
      userId: req.session.user.id,
      nextDue: { $lte: new Date() }
    }).sort({ nextDue: 1 });
    res.json(topics.map(t => ({
      ...t.toJSON(),
      id: String(t._id),
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

    const topic = await Topic.findOne({ _id: topicId, userId: req.session.user.id });
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    const updated = sm2(topic, Number(quality));
    Object.assign(topic, updated);
    await topic.save();

    await ReviewLog.create({
      userId: req.session.user.id,
      topicId,
      quality: Number(quality),
      retention: retentionPercent(topic),
      interval: topic.interval
    });

    res.json({
      ...topic.toJSON(),
      id: String(topic._id),
      retention: retentionPercent(topic),
      urgency: urgency(topic)
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /srs/topics — resolve prerequisite names to IDs then save
router.post('/topics', requireAuthAPI, async (req, res) => {
  try {
    const { name, subject, chapter, exam, prerequisites } = req.body;

    // Resolve prerequisite names → ObjectIds
    let prereqIds = [];
    if (prerequisites && prerequisites.length > 0) {
      const prereqNames = prerequisites.map(p => p.trim()).filter(Boolean);
      const foundTopics = await Topic.find({
        userId: req.session.user.id,
        name: { $in: prereqNames }
      });
      prereqIds = foundTopics.map(t => t._id);
    }

    const topic = await Topic.create({
      userId: req.session.user.id,
      name, subject, chapter, exam,
      prerequisites: prereqIds
    });

    res.json({
      ...topic.toJSON(),
      id: String(topic._id),
      prerequisites: prereqIds.map(id => String(id)),
      retention: 95,
      urgency: 'strong',
      daysUntilDue: 1
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /srs/graph — knowledge graph data (nodes + edges)
router.get('/graph', requireAuthAPI, async (req, res) => {
  try {
    const topics = await Topic.find({ userId: req.session.user.id })
      .populate('prerequisites', '_id name subject chapter');
    const nodes = topics.map(t => ({
      id: String(t._id),
      name: t.name,
      subject: t.subject,
      chapter: t.chapter,
      retention: retentionPercent(t),
      urgency: urgency(t),
      repetitions: t.repetitions,
      interval: t.interval,
      lastStudied: t.lastStudied,
      nextDue: t.nextDue,
    }));
    const edges = [];
    topics.forEach(t => {
      t.prerequisites.forEach(p => {
        edges.push({ from: String(p._id), to: String(t._id) });
      });
    });
    res.json({ nodes, edges });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /srs/page — render the SRS dashboard page
router.get('/page', requireAuth, (req, res) => {
  res.render('srs', { title: 'Spaced Repetition', user: req.session.user });
});
// DELETE /srs/topics/:id — delete a topic
router.delete('/topics/:id', requireAuthAPI, async (req, res) => {
  try {
    const topic = await Topic.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.user.id
    });
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    // Also delete all review logs for this topic
    await ReviewLog.deleteMany({ topicId: req.params.id });

    // Remove this topic from other topics' prerequisites
    await Topic.updateMany(
      { userId: req.session.user.id, prerequisites: req.params.id },
      { $pull: { prerequisites: req.params.id } }
    );

    res.json({ success: true, deletedId: req.params.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;