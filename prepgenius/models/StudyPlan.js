const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  type: { type: String, enum: ['study', 'revision', 'quiz', 'practice', 'break'], default: 'study' },
  duration: { type: Number, default: 45 }, // minutes
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  completed: { type: Boolean, default: false },
  notes: { type: String, default: '' },
});

const studyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  exam: { type: String, required: true },
  tasks: [taskSchema],
  totalMinutes: { type: Number, default: 0 },
  completedMinutes: { type: Number, default: 0 },
  generatedAt: { type: Date, default: Date.now },
});

studyPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
