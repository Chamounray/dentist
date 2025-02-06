const asyncHandler = require('express-async-handler');
const moment = require('moment');
const Analytics = require('../models/Analytics');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const TreatmentPlan = require('../models/TreatmentPlan');
const logger = require('../config/logger');

// @desc    Generate daily analytics
// @route   POST /api/analytics/generate
// @access  Private/Dentist
exports.generateDailyAnalytics = asyncHandler(async (req, res) => {
  const today = moment().startOf('day');
  const tomorrow = moment(today).add(1, 'days');

  // Get appointments for today
  const appointments = await Appointment.find({
    dentist: req.user._id,
    dateTime: {
      $gte: today.toDate(),
      $lt: tomorrow.toDate()
    }
  });

  // Calculate appointment metrics
  const appointmentMetrics = {
    totalAppointments: appointments.length,
    completedAppointments: appointments.filter(a => a.status === 'completed').length,
    cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length,
    noShowAppointments: appointments.filter(a => a.status === 'no-show').length
  };

  // Get new patients registered today
  const newPatients = await Patient.countDocuments({
    dentist: req.user._id,
    createdAt: {
      $gte: today.toDate(),
      $lt: tomorrow.toDate()
    }
  });

  // Calculate completed treatments
  const completedTreatments = await TreatmentPlan.countDocuments({
    dentist: req.user._id,
    status: 'completed',
    'steps.completedDate': {
      $gte: today.toDate(),
      $lt: tomorrow.toDate()
    }
  });

  // Create analytics record
  const analytics = await Analytics.create({
    date: today.toDate(),
    type: 'daily',
    metrics: {
      ...appointmentMetrics,
      newPatients,
      completedTreatments,
      appointmentUtilization: calculateUtilization(appointments.length)
    }
  });

  logger.info(`Daily analytics generated for ${today.format('YYYY-MM-DD')}`);

  res.status(201).json({
    success: true,
    data: analytics
  });
});

// @desc    Get analytics report
// @route   GET /api/analytics/report
// @access  Private/Dentist
exports.getAnalyticsReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, type = 'daily' } = req.query;
  
  const query = { type };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  const analytics = await Analytics.find(query).sort('date');
  const trends = analytics.length >= 2 ? calculateTrends(analytics) : null;

  // Get the total patients count
  const totalPatients = await Patient.countDocuments();

  // Get today's appointments
  const today = moment().startOf('day');
  const tomorrow = moment(today).add(1, 'days');
  const todayAppointments = await Appointment.countDocuments({
    date: {
      $gte: today.toDate(),
      $lt: tomorrow.toDate()
    }
  });

  // Get appointments by status
  const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
  const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
  const noShowAppointments = await Appointment.countDocuments({ status: 'no-show' });
  const scheduledAppointments = await Appointment.countDocuments({ status: 'scheduled' });

  // Get appointments by type
  const appointmentsByType = await Appointment.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get monthly appointments data
  const monthlyAppointments = await Appointment.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Get pending and completed treatments
  const pendingTreatments = await TreatmentPlan.countDocuments({ status: 'active' });
  const completedTreatments = await TreatmentPlan.countDocuments({ status: 'completed' });

  // Get treatment procedures data
  const treatmentProcedures = await TreatmentPlan.aggregate([
    { $unwind: '$procedures' },
    {
      $group: {
        _id: '$procedures.name',
        count: { $sum: 1 },
        avgCost: { $avg: '$procedures.cost' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalPatients,
      todayAppointments,
      pendingTreatments,
      completedTreatments,
      appointmentMetrics: {
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        noShow: noShowAppointments,
        scheduled: scheduledAppointments
      },
      appointmentsByType,
      monthlyAppointments,
      treatmentProcedures,
      analytics,
      trends
    }
  });
});


// @desc    Get patient demographics
// @route   GET /api/analytics/demographics
// @access  Private/Dentist
exports.getPatientDemographics = asyncHandler(async (req, res) => {
  const patients = await Patient.find({ dentist: req.user._id });
  
  const demographics = {
    ageGroups: {
      under18: 0,
      '18-30': 0,
      '31-50': 0,
      above50: 0
    },
    gender: {
      male: 0,
      female: 0,
      other: 0
    }
  };

  // Only process if patients exist
  if (patients && patients.length > 0) {
    patients.forEach(patient => {
      // Calculate age only if dateOfBirth exists
      if (patient.dateOfBirth) {
        const age = moment().diff(moment(patient.dateOfBirth), 'years');
        
        // Update age groups
        if (age < 18) demographics.ageGroups.under18++;
        else if (age <= 30) demographics.ageGroups['18-30']++;
        else if (age <= 50) demographics.ageGroups['31-50']++;
        else demographics.ageGroups.above50++;
      }

      // Update gender statistics only if gender exists
      if (patient.gender && demographics.gender.hasOwnProperty(patient.gender.toLowerCase())) {
        demographics.gender[patient.gender.toLowerCase()]++;
      }
    });
  }

  res.status(200).json({
    success: true,
    data: demographics
  });
});

// @desc    Get treatment success rates
// @route   GET /api/analytics/treatment-success
// @access  Private/Dentist
exports.getTreatmentSuccess = asyncHandler(async (req, res) => {
  const treatmentPlans = await TreatmentPlan.find({ dentist: req.user._id });
  
  const successRates = {
    total: treatmentPlans ? treatmentPlans.length : 0,
    completed: 0,
    cancelled: 0,
    inProgress: 0,
    procedureSuccess: {}
  };

  if (treatmentPlans && treatmentPlans.length > 0) {
    treatmentPlans.forEach(plan => {
      // Update status counts
      if (plan.status) {
        successRates[plan.status]++;
      }

      // Process steps if they exist
      if (plan.steps && Array.isArray(plan.steps)) {
        plan.steps.forEach(step => {
          if (step && step.procedure) {
            if (!successRates.procedureSuccess[step.procedure]) {
              successRates.procedureSuccess[step.procedure] = {
                total: 0,
                completed: 0
              };
            }
            
            successRates.procedureSuccess[step.procedure].total++;
            if (step.status === 'completed') {
              successRates.procedureSuccess[step.procedure].completed++;
            }
          }
        });
      }
    });

    // Calculate percentages
    Object.keys(successRates.procedureSuccess).forEach(procedure => {
      const { total, completed } = successRates.procedureSuccess[procedure];
      successRates.procedureSuccess[procedure].successRate = 
        total > 0 ? (completed / total) * 100 : 0;
    });
  }

  res.status(200).json({
    success: true,
    data: successRates
  });
});

// Helper function to calculate utilization
const calculateUtilization = (appointmentsCount) => {
  const WORKING_HOURS = 8;
  const APPOINTMENT_DURATION = 0.5; // 30 minutes
  const MAX_APPOINTMENTS = (WORKING_HOURS * 60) / (APPOINTMENT_DURATION * 60);
  
  return (appointmentsCount / MAX_APPOINTMENTS) * 100;
};

// Helper function to calculate trends
const calculateTrends = (analytics) => {
  if (analytics.length < 2) return null;

  const trends = {
    appointmentGrowth: 0,
    patientGrowth: 0,
    treatmentSuccess: 0
  };

  const first = analytics[0].metrics;
  const last = analytics[analytics.length - 1].metrics;

  trends.appointmentGrowth = 
    ((last.totalAppointments - first.totalAppointments) / first.totalAppointments) * 100;
  trends.patientGrowth = 
    ((last.newPatients - first.newPatients) / first.newPatients) * 100;
  trends.treatmentSuccess = 
    (last.completedTreatments / last.totalAppointments) * 100;

  return trends;
};