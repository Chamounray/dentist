const express = require('express');
const {
  getToothRecord,
  updateToothCondition,
  getToothHistory,
  getAllTeeth
} = require('../controllers/dentalRecordController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('dentist', 'admin'));

router.route('/patient/:patientId/teeth')
  .get(getAllTeeth);

router.route('/patient/:patientId/tooth/:toothNumber')
  .get(getToothRecord)
  .patch(updateToothCondition);

router.route('/patient/:patientId/tooth/:toothNumber/history')
  .get(getToothHistory);

module.exports = router;