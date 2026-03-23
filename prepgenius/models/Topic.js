const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:         { type: String, required: true },
  subject:      { type: String, enum: ['Physics','Math','Chemistry','Biology'], required: true },
  chapter:      { type: String, required: true },
  exam:         { type: String, enum: ['JEE','NEET','UPSC'], required: true },
  prerequisites:[ { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' } ],
  // SM-2 fields
  easeFactor:   { type: Number, default: 2.5 },
  interval:     { type: Number, default: 1 },
  repetitions:  { type: Number, default: 0 },
  lastStudied:  { type: Date,   default: Date.now },
  nextDue:      { type: Date,   default: Date.now },
}, { timestamps: true });

// Virtual: current retention %
topicSchema.virtual('retention').get(function() {
  const daysSince = (Date.now() - this.lastStudied) / 86400000;
  const S = Math.max(0.5, this.interval * 0.7);
  return Math.round(Math.max(2, Math.exp(-daysSince / S) * 100));
});

topicSchema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('Topic', topicSchema);