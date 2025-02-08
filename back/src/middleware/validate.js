const { validationResult } = require('express-validator');
const logger = require('../config/logger');

// Middleware to check for validation errors
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation error:', errors.array());
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Common validation rules
exports.validationRules = {
  user: {
    email: {
      in: ['body'],
      isEmail: true,
      normalizeEmail: true,
      trim: true,
      errorMessage: 'Please provide a valid email address'
    },
    password: {
      in: ['body'],
      isLength: {
        options: { min: 8 },
        errorMessage: 'Password must be at least 8 characters long'
      }
    },
    firstName: {
      in: ['body'],
      trim: true,
      notEmpty: true,
      errorMessage: 'First name is required'
    },
    lastName: {
      in: ['body'],
      trim: true,
      notEmpty: true,
      errorMessage: 'Last name is required'
    },
    phoneNumber: {
      in: ['body'],
      trim: true,
      matches: {
        options: /^\+?[\d\s-]+$/,
        errorMessage: 'Please provide a valid phone number'
      }
    }
  },
  patient: {
    dateOfBirth: {
      in: ['body'],
      isDate: true,
      errorMessage: 'Please provide a valid date of birth'
    },
    gender: {
      in: ['body'],
      isIn: {
        options: [['male', 'female', 'other']],
        errorMessage: 'Gender must be male, female, or other'
      }
    },
    bloodGroup: {
      in: ['body'],
      optional: true,
      isIn: {
        options: [['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']],
        errorMessage: 'Invalid blood group'
      }
    }
  },
  appointment: {
    dateTime: {
      in: ['body'],
      isISO8601: true,
      errorMessage: 'Please provide a valid date and time'
    },
    duration: {
      in: ['body'],
      isInt: {
        options: { min: 15, max: 180 },
        errorMessage: 'Duration must be between 15 and 180 minutes'
      }
    },
    type: {
      in: ['body'],
      isIn: {
        options: [['checkup', 'cleaning', 'filling', 'root-canal', 'extraction', 'other']],
        errorMessage: 'Invalid appointment type'
      }
    }
  },
  treatmentPlan: {
    title: {
      in: ['body'],
      trim: true,
      notEmpty: true,
      errorMessage: 'Treatment plan title is required'
    },
    startDate: {
      in: ['body'],
      isDate: true,
      errorMessage: 'Please provide a valid start date'
    },
    priority: {
      in: ['body'],
      isIn: {
        options: [['low', 'medium', 'high']],
        errorMessage: 'Priority must be low, medium, or high'
      }
    }
  }
};