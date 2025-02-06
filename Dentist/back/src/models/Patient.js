const mongoose = require('mongoose');

const allergySchema = new mongoose.Schema({
  allergen: String,
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe']
  },
  notes: String
}, { _id: true });

const medicalHistorySchema = new mongoose.Schema({
  condition: String,
  diagnosedDate: Date,
  notes: String,
  status: {
    type: String,
    enum: ['active', 'resolved', 'managed']
  }
}, { _id: true });

const documentSchema = new mongoose.Schema({
  type: String,
  title: String,
  fileUrl: String,
  notes: String,
  uploadDate: Date
}, { _id: true });

const treatmentSchema = new mongoose.Schema({
  type: String,
  date: Date,
  description: String
}, { _id: true });

const toothSchema = new mongoose.Schema({
  number: Number,
  condition: String,
  treatments: [treatmentSchema]
}, { _id: true });

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
   
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  bloodGroup: String,
  allergies: [allergySchema],
  medicalHistory: [medicalHistorySchema],
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },
  documents: [documentSchema],
  teeth: [toothSchema]
}, {
  timestamps: true
});

// Index for faster queries
patientSchema.index({ user: 1 });

module.exports = mongoose.model('Patient', patientSchema);