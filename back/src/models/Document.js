const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['X-Ray', 'Blood Work', 'Prescription', 'Other']
  },
  title: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
documentSchema.index({ patientId: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ uploadDate: -1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document; 