const mongoose = require('mongoose');

const treatmentProcedureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  tooth: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  notes: String,
  completedDate: Date
}, { timestamps: true });

const treatmentPlanSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  dentist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  procedures: [treatmentProcedureSchema],
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  notes: String
}, {
  timestamps: true
});

// Add middleware to update totalCost when procedures change
treatmentPlanSchema.pre('save', function(next) {
  if (this.procedures && this.procedures.length > 0) {
    this.totalCost = this.procedures.reduce((total, procedure) => {
      return total + (procedure.cost || 0);
    }, 0);
  }
  next();
});

module.exports = mongoose.model('TreatmentPlan', treatmentPlanSchema);
