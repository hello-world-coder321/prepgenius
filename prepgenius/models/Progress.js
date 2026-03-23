const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  masteryPercent: { type: Number, default: 0, min: 0, max: 100 },
  wrongAnswers: [{
    question: String,
    userAnswer: String,
    correctAnswer: String,
    timestamp: { type: Date, default: Date.now },
  }],
  quizHistory: [{
    score: Number,
    total: Number,
    difficultyLevel: Number,
    timestamp: { type: Date, default: Date.now },
  }],
  strength: {
    type: String,
    enum: ['weak', 'good', 'mastered'],
    default: 'weak',
  },
  totalCorrect: { type: Number, default: 0 },
  totalAttempted: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

progressSchema.pre('save', function () {
  // Auto-calculate strength from mastery %
  if (this.masteryPercent >= 80) this.strength = 'mastered';
  else if (this.masteryPercent >= 40) this.strength = 'good';
  else this.strength = 'weak';
  this.updatedAt = Date.now();
});

progressSchema.index({ userId: 1, subject: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
