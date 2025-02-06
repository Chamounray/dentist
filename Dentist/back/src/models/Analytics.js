const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  metrics: {
    totalAppointments: Number,
    completedAppointments: Number,
    cancelledAppointments: Number,
    noShowAppointments: Number,
    newPatients: Number,
    completedTreatments: Number,
    averageTreatmentDuration: Number,
    commonProcedures: [{
      name: String,
      count: Number
    }],
    patientDemographics: {
      ageGroups: {
        under18: Number,
        '18-30': Number,
        '31-50': Number,
        above50: Number
      },
      gender: {
        male: Number,
        female: Number,
        other: Number
      }
    },
    appointmentUtilization: Number // percentage of available slots filled
  }
}, {
  timestamps: true
});

analyticsSchema.index({ date: 1, type: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);