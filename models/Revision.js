const mongoose = require('mongoose');

const revisionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  subject: { type: String, required: true },
  lastSeen: { type: Date, default: Date.now },
  interval: { type: Number, default: 1 },          // days until next review
  easeFactor: { type: Number, default: 2.5 },       // SM-2 ease factor
  repetitions: { type: Number, default: 0 },
  nextReviewDate: { type: Date, default: Date.now },
});

/**
 * SM-2 Algorithm Update
 * @param {number} quality - User's self-assessed quality (0-5)
 *   0: complete blackout
 *   1: incorrect, but upon seeing correct answer, remembered
 *   2: incorrect, but correct answer seemed easy to recall
 *   3: correct, with serious difficulty
 *   4: correct, after hesitation
 *   5: perfect response
 */
revisionSchema.methods.updateSM2 = function (quality) {
  if (quality < 0) quality = 0;
  if (quality > 5) quality = 5;

  // Update ease factor
  this.easeFactor = Math.max(1.3,
    this.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  if (quality < 3) {
    // Reset repetitions on failure
    this.repetitions = 0;
    this.interval = 1;
  } else {
    this.repetitions += 1;
    if (this.repetitions === 1) {
      this.interval = 1;
    } else if (this.repetitions === 2) {
      this.interval = 6;
    } else {
      this.interval = Math.round(this.interval * this.easeFactor);
    }
  }

  this.lastSeen = new Date();
  this.nextReviewDate = new Date(Date.now() + this.interval * 24 * 60 * 60 * 1000);
  return this;
};

revisionSchema.index({ userId: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('Revision', revisionSchema);
