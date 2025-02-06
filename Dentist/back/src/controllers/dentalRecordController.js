const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs').promises;
const Patient = require('../models/Patient');
const logger = require('../config/logger');
const Document = require('../models/Document');

// @desc    Upload patient document
// @route   POST /api/patients/:patientId/documents
// @access  Private/Dentist
// ... other imports and functions ...
exports.uploadDocument = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request fileInfo:', req.fileInfo);
    console.log('Request headers:', req.headers);

    const { patientId } = req.params;
    const { type, title, notes } = req.body;
    
    if (!req.file || !req.fileInfo) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded or file information missing'
      });
    }

    const fileInfo = req.fileInfo;

    // Create document record in database
    const document = await Document.create({
      patientId,
      type,
      title,
      notes,
      filename: fileInfo.filename,
      originalName: fileInfo.originalname,
      mimeType: fileInfo.mimetype,
      size: fileInfo.size,
      path: fileInfo.path
    });

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Query the Document collection instead of Patient
    const documents = await Document.find({ patientId })
      .sort({ uploadDate: -1 });

    // Transform the documents to match the frontend expectations
    const transformedDocs = documents.map(doc => ({
      _id: doc._id,
      type: doc.type,
      title: doc.title,
      notes: doc.notes,
      fileUrl: `/uploads/${patientId}/${doc.filename}`,
      originalName: doc.originalName,
      uploadDate: doc.uploadDate
    }));

    res.status(200).json({
      success: true,
      data: transformedDocs
    });

  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving documents'
    });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file from filesystem
    const fs = require('fs');
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    // Delete document from database
    await Document.findByIdAndDelete(documentId);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message
    });
  }
};

// @desc    Update tooth record
// @route   PUT /api/patients/:patientId/teeth/:toothNumber
// @access  Private/Dentist
exports.updateToothRecord = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.patientId);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  const { condition, treatment } = req.body;
  const toothNumber = parseInt(req.params.toothNumber);

  let tooth = patient.teeth.find(t => t.number === toothNumber);

  if (!tooth) {
    tooth = {
      number: toothNumber,
      condition: condition,
      treatments: []
    };
    patient.teeth.push(tooth);
  } else {
    tooth.condition = condition;
  }

  if (treatment) {
    tooth.treatments.push({
      type: treatment.type,
      date: new Date(),
      description: treatment.description
    });
  }

  await patient.save();

  logger.info(`Tooth record updated for patient: ${patient._id}, tooth: ${toothNumber}`);

  res.status(200).json({
    success: true,
    data: tooth
  });
});

// Add method to get patient documents
exports.getPatientDocuments = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const documents = await Document.find({ patientId })
      .sort({ uploadDate: -1 });
    
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error fetching patient documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient documents',
      error: error.message
    });
  }
};

// @desc    Get tooth condition and history
// @route   GET /api/dental-records/patient/:patientId/tooth/:toothNumber
exports.getToothRecord = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.patientId);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  const tooth = patient.teeth.find(t => t.number === parseInt(req.params.toothNumber));
  
  res.json({
    success: true,
    data: tooth || { number: parseInt(req.params.toothNumber), condition: 'healthy', treatments: [] }
  });
});

// @desc    Update tooth condition
// @route   PATCH /api/dental-records/patient/:patientId/tooth/:toothNumber
exports.updateToothCondition = asyncHandler(async (req, res) => {
  const { condition } = req.body;
  
  const patient = await Patient.findById(req.params.patientId);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  let tooth = patient.teeth.find(t => t.number === parseInt(req.params.toothNumber));
  
  if (tooth) {
    tooth.condition = condition;
    tooth.treatments.push({
      type: condition,
      date: new Date(),
      description: `Condition updated to ${condition}`
    });
  } else {
    patient.teeth.push({
      number: parseInt(req.params.toothNumber),
      condition,
      treatments: [{
        type: condition,
        date: new Date(),
        description: `Initial condition set to ${condition}`
      }]
    });
  }

  await patient.save();
  logger.info(`Updated tooth ${req.params.toothNumber} condition for patient ${req.params.patientId}`);

  res.json({
    success: true,
    data: patient.teeth.find(t => t.number === parseInt(req.params.toothNumber))
  });
});

// @desc    Get tooth history
// @route   GET /api/dental-records/patient/:patientId/tooth/:toothNumber/history
exports.getToothHistory = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.patientId);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  const tooth = patient.teeth.find(t => t.number === parseInt(req.params.toothNumber));
  
  res.json({
    success: true,
    data: tooth ? tooth.treatments : []
  });
});

// Add this new method to your existing controller
exports.getAllTeeth = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.patientId)
    .select('teeth');
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Initialize teeth array if it doesn't exist
  if (!patient.teeth) {
    patient.teeth = [];
  }

  res.json({
    success: true,
    data: patient.teeth
  });
});

