const { body } = require('express-validator');

exports.createQuestionValidator = [
  body('subjectId')
    .notEmpty().withMessage('Subject ID is required')
    .isUUID().withMessage('Subject ID must be a valid UUID'),
  
  body('topic')
    .trim()
    .notEmpty().withMessage('Topic is required')
    .isLength({ min: 2, max: 200 }).withMessage('Topic must be between 2 and 200 characters'),
  
  body('text')
    .trim()
    .notEmpty().withMessage('Question text is required')
    .isLength({ min: 10 }).withMessage('Question must be at least 10 characters'),
  
  body('type')
    .optional()
    .isIn(['multiple-choice', 'theory']).withMessage('Type must be multiple-choice or theory'),
  
  body('options')
    .if(body('type').equals('multiple-choice'))
    .isArray({ min: 2, max: 5 }).withMessage('Multiple choice questions must have 2-5 options'),
  
  body('correctAnswer')
    .notEmpty().withMessage('Correct answer is required'),
  
  body('explanation')
    .trim()
    .notEmpty().withMessage('Explanation is required')
    .isLength({ min: 10 }).withMessage('Explanation must be at least 10 characters'),
  
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
  
  body('points')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Points must be between 1 and 10')
];

exports.bulkUploadValidator = [
  body('questions')
    .isArray({ min: 1 }).withMessage('Questions array is required and must not be empty')
    .custom((questions) => {
      if (questions.length > 1000) {
        throw new Error('Cannot upload more than 1000 questions at once');
      }
      return true;
    })
];