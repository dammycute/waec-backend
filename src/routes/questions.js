const express = require('express');
const router = express.Router();
const {
  getAllQuestions,
  createQuestion,
  bulkUploadQuestions,
  uploadQuestionsFile,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Routes for Admin and Teacher
router.get('/', authorize('admin', 'teacher'), getAllQuestions);
router.post('/', authorize('admin', 'teacher'), createQuestion);
router.post('/bulk', authorize('admin', 'teacher'), bulkUploadQuestions);
router.post('/upload', authorize('admin', 'teacher'), uploadQuestionsFile);
router.put('/:id', authorize('admin', 'teacher'), updateQuestion);
router.delete('/:id', authorize('admin', 'teacher'), deleteQuestion);

module.exports = router;