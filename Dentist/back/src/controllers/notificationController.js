const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const Appointment = require('../models/Appointment');
const logger = require('../config/logger');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    recipient: req.user._id,
    scheduledFor: { $lte: new Date() }
  })
    .sort('-createdAt')
    .limit(50);

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this notification'
    });
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Create appointment reminders
// @route   POST /api/notifications/create-reminders
// @access  Private
exports.createAppointmentReminders = asyncHandler(async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const appointments = await Appointment.find({
    dateTime: {
      $gte: new Date().setHours(0, 0, 0, 0),
      $lt: tomorrow.setHours(23, 59, 59, 999)
    },
    status: 'scheduled'
  }).populate('patient');

  for (const appointment of appointments) {
    await Notification.create({
      recipient: appointment.patient.user,
      type: 'appointment_reminder',
      title: 'Appointment Reminder',
      message: `You have an appointment tomorrow at ${appointment.dateTime.toLocaleTimeString()}`,
      relatedTo: {
        model: 'Appointment',
        id: appointment._id
      },
      scheduledFor: new Date()
    });
  }

  logger.info('Appointment reminders created');
});