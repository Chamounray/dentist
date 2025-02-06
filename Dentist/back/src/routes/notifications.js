const express = require('express');
const {
  getNotifications,
  markAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getNotifications);

router
  .route('/:id')
  .put(markAsRead);

module.exports = router;