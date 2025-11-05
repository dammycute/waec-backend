// src/routes/reviews.js
const express = require('express');
const router = express.Router();
const {
  getQuestionReview,
  getFilteredQuestions
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get full question review for an attempt
router.get('/:attemptId', getQuestionReview);

// Get filtered questions
router.get('/:attemptId/filter/:filterType', getFilteredQuestions);

module.exports = router;