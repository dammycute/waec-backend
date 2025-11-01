const express = require('express');
const router = express.Router();
const { getSubjects, getSubjectTopics } = require('../controllers/subjectController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSubjects);
router.get('/:id/topics', protect, getSubjectTopics);

module.exports = router;