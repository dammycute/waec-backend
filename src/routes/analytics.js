const express = require('express');
const router = express.Router();
const {
  getMyAnalytics,
  getSubjectPerformance,
  getTopicMastery,
    getRecentTests,
  getWeeklyProgress
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, getMyAnalytics);
router.get('/subject-performance', protect, getSubjectPerformance);
router.get('/recent-tests', protect, getRecentTests);
router.get('/topic-mastery', protect, getTopicMastery);
router.get('/weekly-progress', protect, getWeeklyProgress);

module.exports = router;