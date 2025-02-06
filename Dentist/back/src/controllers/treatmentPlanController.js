const TreatmentPlan = require('../models/TreatmentPlan');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');
const logger = require('../config/logger');



// @desc    Get all treatment plans for all patients
// @access  Private
exports.getAllPatientTreatmentPlans = async (req, res) => {
  try {
    const plans = await TreatmentPlan.find()
      .populate('patient', 'firstName lastName')
      .populate('dentist', 'firstName lastName')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    // Log the full error for debugging
    console.error(`Error in getAllPatientTreatmentPlans: ${error.message}`, error);

    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};






// @desc    Get all treatment plans for a patient
// @route   GET /api/v1/treatment-plans/patient/:patientId
// @access  Private
exports.getPatientTreatmentPlans = async (req, res) => {
  try {
    const plans = await TreatmentPlan.find({ patient: req.params.patientId })
      .populate('dentist', 'firstName lastName')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single treatment plan
// @route   GET /api/v1/treatment-plans/:id
// @access  Private
exports.getTreatmentPlan = async (req, res) => {
  try {
    const plan = await TreatmentPlan.findById(req.params.id)
      .populate('dentist', 'firstName lastName')
      .populate('patient', 'firstName lastName');

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: `Treatment plan not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new treatment plan
// @route   POST /api/v1/treatment-plans/patient/:patientId
// @access  Private
exports.createTreatmentPlan = async (req, res) => {
  try {
    // Check if patient exists
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: `Patient not found with id of ${req.params.patientId}`
      });
    }

    // Add patient and dentist to req.body
    req.body.patient = req.params.patientId;
    req.body.dentist = req.user.id;

    const plan = await TreatmentPlan.create(req.body);

    // Create notification for patient
    await Notification.create({
      recipient: req.params.patientId,
      type: 'treatment_update',
      title: 'New Treatment Plan Created',
      message: `A new treatment plan "${req.body.name}" has been created for you.`,
      relatedTo: {
        model: 'TreatmentPlan',
        id: plan._id
      }
    });

    logger.info(`Treatment plan created: ${plan._id}`);

    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update treatment plan
// @route   PUT /api/v1/treatment-plans/:id
// @access  Private
exports.updateTreatmentPlan = async (req, res) => {
  try {
    let plan = await TreatmentPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: `Treatment plan not found with id of ${req.params.id}`
      });
    }

    // Make sure user is the dentist who created the plan
    if (plan.dentist.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: `User ${req.user.id} is not authorized to update this treatment plan`
      });
    }

    plan = await TreatmentPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete treatment plan
// @route   DELETE /api/v1/treatment-plans/:id
// @access  Private
exports.deleteTreatmentPlan = async (req, res) => {
  try {
    const plan = await TreatmentPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: `Treatment plan not found with id of ${req.params.id}`
      });
    }

    // Make sure user is the dentist who created the plan
    if (plan.dentist.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: `User ${req.user.id} is not authorized to delete this treatment plan`
      });
    }

    await plan.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update procedure status
// @route   PATCH /api/v1/treatment-plans/:id/procedures/:procedureId/status
// @access  Private
exports.updateProcedureStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const plan = await TreatmentPlan.findOneAndUpdate(
      { 
        _id: req.params.id,
        'procedures._id': req.params.procedureId 
      },
      { 
        $set: {
          'procedures.$.status': status,
          'procedures.$.completedDate': status === 'completed' ? Date.now() : null
        }
      },
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Treatment plan or procedure not found'
      });
    }

    // If procedure is completed, update tooth condition to healthy
    if (status === 'completed') {
      const procedure = plan.procedures.find(p => p._id.toString() === req.params.procedureId);
      if (procedure && procedure.tooth) {
        // Update tooth condition to healthy
        await Patient.findByIdAndUpdate(
          plan.patient,
          {
            $set: {
              'teeth.$[tooth].condition': 'healthy'
            }
          },
          {
            arrayFilters: [{ 'tooth.number': parseInt(procedure.tooth) }],
            new: true
          }
        );
      }

      // Check if all procedures are completed
      const allCompleted = plan.procedures.every(proc => proc.status === 'completed');
      if (allCompleted) {
        plan.status = 'completed';
        await plan.save();
      }
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error updating procedure status:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};