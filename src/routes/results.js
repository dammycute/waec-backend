const express = require('express');
const router = express.Router();
const {
  getMyResults,
  getResult,
  getResultWithReview
} = require('../controllers/resultController');
const { protect } = require('../middleware/auth');

router.get('/my-results', protect, getMyResults);
router.get('/:id', protect, getResult);
router.get('/:id/review', protect, getResultWithReview);

module.exports = router;