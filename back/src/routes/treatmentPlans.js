const express = require('express');
const {
  getPatientTreatmentPlans,
  getTreatmentPlan,
  createTreatmentPlan,
  updateTreatmentPlan,
  deleteTreatmentPlan,
  updateProcedureStatus,
  getAllPatientTreatmentPlans
} = require('../controllers/treatmentPlanController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('dentist', 'admin'));

router.route('/patient/:patientId')
  .get(getPatientTreatmentPlans)
  .post(createTreatmentPlan);

router.route('/:id')
  .get(getTreatmentPlan)
  .put(updateTreatmentPlan)
  .delete(deleteTreatmentPlan);

  
router.route('/all')
.get(getAllPatientTreatmentPlans);

router.route('/:id/procedures/:procedureId/status')
  .patch(updateProcedureStatus);

module.exports = router;