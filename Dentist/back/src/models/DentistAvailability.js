// models/DentistAvailability.js
const mongoose = require('mongoose');

const DentistAvailabilitySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // e.g., "09:00"
    required: true
  },
  endTime: {
    type: String, // e.g., "17:00"
    required: true
  }
});

module.exports = mongoose.model('DentistAvailability', DentistAvailabilitySchema);
