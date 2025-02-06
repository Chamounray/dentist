const express = require('express');
const {
  registerPatient,
  getPatients,
  getPatient,
  updatePatient,
  getPatientTeeth,
  updatePatientTeeth,
  addAllergy,
  updateAllergy,
  deleteAllergy
} = require('../controllers/patientController');
const {
  uploadDocument,
  getDocuments,
  deleteDocument,
  updateToothRecord
} = require('../controllers/dentalRecordController');
const { protect, authorize } = require('../middleware/auth');
const { uploadMiddleware } = require('../utils/fileUpload');

const router = express.Router();

router.use(protect);

// Base patient routes
router
  .route('/')
  .post(authorize('dentist'), registerPatient)
  .get(authorize('dentist'), getPatients);

router
  .route('/:id')
  .get(getPatient)
  .put(authorize('dentist'), updatePatient);

// Document routes
router
  .route('/:patientId/documents')
  .post(authorize('dentist'), uploadMiddleware, uploadDocument)
  .get(getDocuments);

router
  .route('/:patientId/documents/:documentId')
  .delete(authorize('dentist'), deleteDocument);

// Tooth record routes
router
  .route('/:patientId/teeth/:toothNumber')
  .put(authorize('dentist'), updateToothRecord);

router.route('/:id/teeth')
  .get(getPatientTeeth)
  .put(updatePatientTeeth);

// Allergy routes
router.route('/:patientId/allergies')
  .post(addAllergy);

router.route('/:patientId/allergies/:allergyId')
  .put(updateAllergy)
  .delete(deleteAllergy);

module.exports = router;