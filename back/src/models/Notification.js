const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['appointment_reminder', 'treatment_update', 'document_added', 'general'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Appointment', 'TreatmentPlan', 'Patient']
    },
    id: mongoose.Schema.Types.ObjectId
  },
  read: {
    type: Boolean,
    default: false
  },
  scheduledFor: Date
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ scheduledFor: 1 });

module.exports = mongoose.model('Notification', notificationSchema);