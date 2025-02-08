const asyncHandler = require('express-async-handler');
const Patient = require('../models/Patient');
const User = require('../models/User');
const logger = require('../config/logger');

// @desc    Register new patient
// @route   POST /api/patients
// @access  Private/Dentist
exports.registerPatient = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    dateOfBirth,
    gender,
    bloodGroup,
    medicalHistory,
    allergies,
    emergencyContact
  } = req.body;

  // Create user account for patient
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    role: 'patient'
  });

  // Create patient profile
  const patient = await Patient.create({
    user: user._id,
    dentist: req.user._id,
    dateOfBirth,
    gender,
    bloodGroup,
    medicalHistory,
    allergies,
    emergencyContact
  });

  logger.info(`New patient registered: ${patient._id}`);

  res.status(201).json({
    success: true,
    data: patient
  });
});

// @desc    Get all patients for dentist
// @route   GET /api/patients
// @access  Private/Dentist
exports.getPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find()  // Removed the filter
    .populate('user', 'firstName lastName email phoneNumber')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: patients.length,
    data: patients
  });
});


// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('user', 'firstName lastName email phoneNumber')
      .lean();

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private/Dentist
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email phoneNumber');

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Add medical condition
exports.addMedicalCondition = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.patientId);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  patient.medicalHistory.push(req.body);
  await patient.save();

  res.status(201).json({
    success: true,
    data: patient
  });
});

// Update medical condition
exports.updateMedicalCondition = asyncHandler(async (req, res) => {
  const patient = await Patient.findOneAndUpdate(
    { 
      _id: req.params.patientId,
      'medicalHistory._id': req.params.conditionId 
    },
    { 
      $set: {
        'medicalHistory.$': req.body
      }
    },
    { new: true }
  );

  if (!patient) {
    res.status(404);
    throw new Error('Patient or medical condition not found');
  }

  res.json({
    success: true,
    data: patient
  });
});

// Delete medical condition
exports.deleteMedicalCondition = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(
    req.params.patientId,
    {
      $pull: {
        medicalHistory: { _id: req.params.conditionId }
      }
    },
    { new: true }
  );

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  res.json({
    success: true,
    data: patient
  });
});

exports.getPatientTeeth = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .select('teeth')
      .lean();

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient.teeth
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

exports.updatePatientTeeth = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { teeth: req.body },
      { new: true, runValidators: true }
    ).select('teeth');

    res.status(200).json({
      success: true,
      data: patient.teeth
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

exports.addAllergy = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.patientId,
      { $push: { allergies: req.body } },
      { new: true, runValidators: true }
    ).select('allergies');

    res.status(201).json({
      success: true,
      data: patient.allergies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

exports.updateAllergy = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { 
        _id: req.params.patientId,
        'allergies._id': req.params.allergyId 
      },
      { 
        $set: {
          'allergies.$.allergen': req.body.allergen,
          'allergies.$.severity': req.body.severity,
          'allergies.$.notes': req.body.notes
        } 
      },
      { new: true, runValidators: true }
    ).select('allergies');

    res.status(200).json({
      success: true,
      data: patient.allergies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

exports.deleteAllergy = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.patientId,
      { $pull: { allergies: { _id: req.params.allergyId } } },
      { new: true }
    ).select('allergies');

    res.status(200).json({
      success: true,
      data: patient.allergies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};


