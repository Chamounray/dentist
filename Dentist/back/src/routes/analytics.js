const express = require('express');
const {
  generateDailyAnalytics,
  getAnalyticsReport,
  getPatientDemographics,
  getTreatmentSuccess
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('dentist'));

router.post('/generate', generateDailyAnalytics);
router.get('/report', getAnalyticsReport);
router.get('/demographics', getPatientDemographics);
router.get('/treatment-success', getTreatmentSuccess);

module.exports = router;