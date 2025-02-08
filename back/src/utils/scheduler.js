const cron = require('node-cron');
const { createAppointmentReminders } = require('../controllers/notificationController');
const logger = require('../config/logger');

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    await createAppointmentReminders();
  } catch (error) {
    logger.error('Error creating appointment reminders:', error);
  }
});