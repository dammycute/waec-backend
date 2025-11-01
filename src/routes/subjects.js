const express = require('express');
const router = express.Router();
const { getSubjects, getSubjectTopics,getAllSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject } = require('../controllers/subjectController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSubjects);
router.get('/:id/topics', protect, getSubjectTopics);
router.get('/all', protect, getAllSubjects);
router.get('/:id', protect, getSubject);
router.post('/', protect, createSubject);
router.put('/:id', protect, updateSubject);
router.delete('/:id', protect, deleteSubject);
    
module.exports = router;