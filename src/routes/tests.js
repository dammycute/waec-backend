const express = require('express');
const router = express.Router();
const {
  getTests,
  getTest,
  createTest,
  startTest,
  submitTest
} = require('../controllers/testController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getTests);
router.get('/:id', protect, getTest);
router.post('/', protect, authorize('admin', 'teacher'), createTest);
router.post('/:id/start', protect, startTest);
router.post('/:id/submit', protect, submitTest);

module.exports = router;