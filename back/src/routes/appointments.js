const express = require('express');
const {
  getPatientAppointments,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getAvailableSlots,
  getRecentAppointments,
  getUpcomingAppointments,
  getDentistAppointments
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/patient/:patientId')
  .get(getPatientAppointments);

router.route('/available-slots')
  .get(getAvailableSlots);

router.route('/')
  .post(createAppointment);

router.route('/:id/status')
  .patch(updateAppointmentStatus);

router.route('/:id')
  .delete(deleteAppointment);

// NEW endpoints for dashboard
router.get('/recent', authorize('dentist'), getRecentAppointments);
router.get('/upcoming', authorize('dentist'), getUpcomingAppointments);
router.get('/appointments', getDentistAppointments);

module.exports = router;
