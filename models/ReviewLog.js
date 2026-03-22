const mongoose = require('mongoose');

const reviewLogSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  quality:   { type: Number, min: 0, max: 5, required: true }, // SM-2 score
  retention: { type: Number }, // retention % at time of review
  interval:  { type: Number }, // interval after this review
}, { timestamps: true });

module.exports = mongoose.model('ReviewLog', reviewLogSchema);