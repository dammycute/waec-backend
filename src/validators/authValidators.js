const { body } = require('express-validator');

exports.registerValidator = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 3 }).withMessage('Full name must be at least 3 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^(\+234|0)[789]\d{9}$/).withMessage('Please provide a valid Nigerian phone number'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('school')
    .optional()
    .trim()
    .notEmpty().withMessage('School name is required for students'),
  
  body('class')
    .optional()
    .isIn(['SS1', 'SS2', 'SS3']).withMessage('Class must be SS1, SS2, or SS3')
];

exports.loginValidator = [
  // `emailOrPhone` field (we’ll call it `email`) — must not be empty
  body('email')
    .trim()
    .notEmpty().withMessage('Email or phone is required')
    .bail()
    // Custom check: either valid email OR valid phone number
    .custom(value => {
      const emailRegex = /^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
      const phoneRegex = /^\d{10,15}$/;  // adjust length to your phone format
      if (emailRegex.test(value) || phoneRegex.test(value)) {
        return true;
      }
      throw new Error('Must be a valid email or phone number');
    }),

  body('password')
    .notEmpty().withMessage('Password is required')
    .bail()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];


exports.forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
];

exports.resetPasswordValidator = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];