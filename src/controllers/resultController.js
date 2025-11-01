const { TestAttempt, Test, Subject, Question } = require('../models');
const { Op } = require('sequelize');

// @desc    Get user's test results
// @route   GET /api/results/my-results
// @access  Private
exports.getMyResults = async (req, res, next) => {
  try {
    const { limit = 10, sort = '-completedAt' } = req.query;

    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const sortOrder = sort.startsWith('-') ? 'DESC' : 'ASC';

    const attempts = await TestAttempt.findAll({
      where: { 
        userId: req.user.id,
        status: 'completed'
      },
      include: [{
        model: Test,
        as: 'test',
        include: [{
          model: Subject,
          as: 'subject',
          attributes: ['name', 'code', 'icon', 'color']
        }],
        attributes: ['id', 'title', 'type', 'totalQuestions', 'totalPoints']
      }],
      order: [[sortField, sortOrder]],
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single test result
// @route   GET /api/results/:id
// @access  Private
exports.getResult = async (req, res, next) => {
  try {
    const attempt = await TestAttempt.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      },
      include: [{
        model: Test,
        as: 'test',
        include: [{
          model: Subject,
          as: 'subject'
        }]
      }]
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found'
      });
    }

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get test result with question review
// @route   GET /api/results/:id/review
// @access  Private
exports.getResultWithReview = async (req, res, next) => {
  try {
    const attempt = await TestAttempt.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      },
      include: [{
        model: Test,
        as: 'test',
        include: [{
          model: Subject,
          as: 'subject'
        }]
      }]
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found'
      });
    }

    // Get all questions from the test with full details
    const test = await Test.findByPk(attempt.testId);
    const questions = await Question.findAll({
      where: {
        id: { [Op.in]: test.questions }
      },
      include: [{
        model: Subject,
        as: 'subject',
        attributes: ['name', 'code']
      }]
    });

    // Map user's answers to questions
    const reviewData = questions.map(question => {
      const userAnswer = attempt.answers.find(a => a.question === question.id);
      
      return {
        question: {
          id: question.id,
          text: question.text,
          type: question.type,
          options: question.options,
          topic: question.topic,
          difficulty: question.difficulty,
          explanation: question.explanation,
          correctAnswer: question.correctAnswer
        },
        userAnswer: userAnswer?.selectedAnswer || null,
        isCorrect: userAnswer?.isCorrect || false,
        timeTaken: userAnswer?.timeTaken || 0,
        flagged: userAnswer?.flagged || false
      };
    });

    res.status(200).json({
      success: true,
      data: {
        attempt,
        review: reviewData
      }
    });
  } catch (error) {
    next(error);
  }
};