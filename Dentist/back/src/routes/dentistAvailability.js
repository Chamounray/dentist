const express = require('express');
const router = express.Router();
const dentistAvailabilityController = require('../controllers/dentistAvailabilityController');

// Create dentist availability
router.post('/', dentistAvailabilityController.createAvailability);

// Get all dentist availability entries (or for a specific day if you later add a query filter)
router.get('/', dentistAvailabilityController.getAvailability);

// Update dentist availability entry by its own ID
router.put('/:id', dentistAvailabilityController.updateAvailability);

// Delete dentist availability entry
router.delete('/:id', dentistAvailabilityController.deleteAvailability);

module.exports = router;
