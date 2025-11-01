const { Question, Subject } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Private (Admin/Teacher)
exports.getAllQuestions = async (req, res, next) => {
  try {
    const { subject, topic, difficulty, page = 1, limit = 50 } = req.query;

    const where = { isActive: true };
    
    if (subject) where.subjectId = subject;
    if (topic) where.topic = topic;
    if (difficulty) where.difficulty = difficulty;

    const offset = (page - 1) * limit;

    const { count, rows: questions } = await Question.findAndCountAll({
      where,
      include: [{
        model: Subject,
        as: 'subject',
        attributes: ['name', 'code', 'icon', 'color']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create single question
// @route   POST /api/questions
// @access  Private (Admin/Teacher)
exports.createQuestion = async (req, res, next) => {
  try {
    const {
      subjectId,
      topic,
      text,
      type,
      options,
      correctAnswer,
      explanation,
      difficulty,
      points,
      imageUrl,
      tags
    } = req.body;

    // Verify subject exists
    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const question = await Question.create({
      subjectId,
      topic,
      text,
      type: type || 'multiple-choice',
      options: options || [],
      correctAnswer,
      explanation,
      difficulty: difficulty || 'medium',
      points: points || 1,
      imageUrl,
      tags: tags || [],
      isActive: true,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk upload questions
// @route   POST /api/questions/bulk
// @access  Private (Admin/Teacher)
exports.bulkUploadQuestions = async (req, res, next) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Questions array is required'
      });
    }

    // Validate all questions have required fields
    const invalidQuestions = [];
    questions.forEach((q, index) => {
      if (!q.subjectId || !q.topic || !q.text || !q.correctAnswer || !q.explanation) {
        invalidQuestions.push(index);
      }
    });

    if (invalidQuestions.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid questions at indices: ${invalidQuestions.join(', ')}. Missing required fields.`
      });
    }

    // Add metadata to each question
    const questionsToCreate = questions.map(q => ({
      ...q,
      type: q.type || 'multiple-choice',
      difficulty: q.difficulty || 'medium',
      points: q.points || 1,
      tags: q.tags || [],
      options: q.options || [],
      isActive: true,
      createdBy: req.user.id,
      usageCount: 0,
      correctCount: 0
    }));

    // Bulk create
    const createdQuestions = await Question.bulkCreate(questionsToCreate, {
      validate: true,
      returning: true
    });

    res.status(201).json({
      success: true,
      message: `${createdQuestions.length} questions uploaded successfully`,
      data: {
        count: createdQuestions.length,
        questions: createdQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload questions from CSV/JSON
// @route   POST /api/questions/upload
// @access  Private (Admin/Teacher)
exports.uploadQuestionsFile = async (req, res, next) => {
  try {
    // This assumes you're using a file upload middleware like multer
    // For now, we'll handle JSON data from request body
    const { fileData, format } = req.body;

    if (!fileData) {
      return res.status(400).json({
        success: false,
        message: 'File data is required'
      });
    }

    let questions = [];

    // Parse based on format
    if (format === 'json') {
      questions = typeof fileData === 'string' ? JSON.parse(fileData) : fileData;
    } else if (format === 'csv') {
      // You would use a CSV parser here
      return res.status(400).json({
        success: false,
        message: 'CSV parsing not implemented yet. Use JSON format.'
      });
    }

    if (!Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'File data must be an array of questions'
      });
    }

    // Use the bulk upload function
    req.body.questions = questions;
    return exports.bulkUploadQuestions(req, res, next);

  } catch (error) {
    next(error);
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private (Admin/Teacher)
exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByPk(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const {
      topic,
      text,
      type,
      options,
      correctAnswer,
      explanation,
      difficulty,
      points,
      imageUrl,
      tags,
      isActive
    } = req.body;

    await question.update({
      topic: topic || question.topic,
      text: text || question.text,
      type: type || question.type,
      options: options || question.options,
      correctAnswer: correctAnswer || question.correctAnswer,
      explanation: explanation || question.explanation,
      difficulty: difficulty || question.difficulty,
      points: points !== undefined ? points : question.points,
      imageUrl: imageUrl || question.imageUrl,
      tags: tags || question.tags,
      isActive: isActive !== undefined ? isActive : question.isActive
    });

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private (Admin/Teacher)
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByPk(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Soft delete
    await question.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};