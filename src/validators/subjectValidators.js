const { body } = require('express-validator');

exports.createSubjectValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Subject name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .isIn(['Mathematics', 'English', 'Biology', 'Chemistry', 'Physics', 'Economics', 'Government', 'Literature'])
    .withMessage('Invalid subject name'),
  
  body('code')
    .trim()
    .notEmpty().withMessage('Subject code is required')
    .isLength({ min: 2, max: 10 }).withMessage('Code must be between 2 and 10 characters')
    .toUpperCase(),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  
  body('icon')
    .optional()
    .trim(),
  
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color code'),
  
  body('topics')
    .optional()
    .isArray().withMessage('Topics must be an array')
];