const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  extractedText: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now },
});

documentSchema.index({ userId: 1, uploadedAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
