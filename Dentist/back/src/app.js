const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/error');
const logger = require('./config/logger');
require('dotenv').config();
const appointments = require('./routes/appointments');

// Initialize express
const app = express();

// Connect to database
connectDB();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:4200', // Your frontend origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount routes that need raw body parsing (file uploads)
app.use('/api/patients', require('./routes/patients'));

// Body parsing middleware - after file upload routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Mount other routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', appointments);
app.use('/api/treatment-plans', require('./routes/treatmentPlans'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/dentist-availability',require('./routes/dentistAvailability'));
app.use('/api/dental-records', require('./routes/dentalRecords'));

// Error Handling
app.use(errorHandler);

// Handle unhandled routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

// Initialize scheduler for notifications and reminders
require('./utils/scheduler');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;