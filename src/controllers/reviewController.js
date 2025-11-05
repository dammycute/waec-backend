// src/controllers/reviewController.js
const { TestAttempt, Test, Subject, Question } = require('../models');
const { Op } = require('sequelize');

// @desc    Get question review for a test attempt
// @route   GET /api/reviews/:attemptId
// @access  Private
exports.getQuestionReview = async (req, res, next) => {
  try {
    const { attemptId } = req.params;

    // Find the test attempt
    const attempt = await TestAttempt.findOne({
      where: { 
        id: attemptId,
        userId: req.user.id // Ensure user owns this attempt
      }
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    // Get question IDs from the attempt answers
    const questionIds = attempt.answers.map(a => a.question);

    // Fetch all questions with full details including correct answers and explanations
    const questions = await Question.findAll({
      where: {
        id: { [Op.in]: questionIds }
      },
      include: [{
        model: Subject,
        as: 'subject',
        attributes: ['name', 'code', 'icon', 'color']
      }]
    });

    // Map questions with user answers and results
    const reviewData = attempt.answers.map((answer, index) => {
      const question = questions.find(q => q.id === answer.question);
      
      if (!question) {
        console.warn(`Question ${answer.question} not found`);
        return null;
      }

      return {
        number: index + 1,
        questionId: question.id,
        text: question.text,
        type: question.type,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer: answer.selectedAnswer,
        isCorrect: answer.isCorrect,
        explanation: question.explanation,
        topic: question.topic,
        difficulty: question.difficulty,
        points: question.points,
        timeTaken: answer.timeTaken,
        flagged: answer.flagged,
        imageUrl: question.imageUrl
      };
    }).filter(Boolean);

    // Calculate statistics
    const stats = {
      totalQuestions: reviewData.length,
      correctAnswers: reviewData.filter(q => q.isCorrect).length,
      incorrectAnswers: reviewData.filter(q => !q.isCorrect && q.userAnswer).length,
      unanswered: reviewData.filter(q => !q.userAnswer).length,
      flaggedQuestions: reviewData.filter(q => q.flagged).length
    };

    res.status(200).json({
      success: true,
      data: {
        attemptId: attempt.id,
        testInfo: {
          completedAt: attempt.completedAt,
          score: attempt.score,
          percentage: attempt.percentage,
          timeTaken: attempt.timeTaken,
          totalQuestions: attempt.totalQuestions
        },
        stats,
        questions: reviewData
      }
    });

  } catch (error) {
    console.error('Error fetching question review:', error);
    next(error);
  }
};

// @desc    Get filtered questions (incorrect, flagged, etc.)
// @route   GET /api/reviews/:attemptId/filter/:filterType
// @access  Private
exports.getFilteredQuestions = async (req, res, next) => {
  try {
    const { attemptId, filterType } = req.params;

    // Find the test attempt
    const attempt = await TestAttempt.findOne({
      where: { 
        id: attemptId,
        userId: req.user.id
      }
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    // Get question IDs from the attempt answers
    const questionIds = attempt.answers.map(a => a.question);

    // Fetch all questions
    const questions = await Question.findAll({
      where: {
        id: { [Op.in]: questionIds }
      },
      include: [{
        model: Subject,
        as: 'subject',
        attributes: ['name', 'code']
      }]
    });

    // Map questions with user answers
    let reviewData = attempt.answers.map((answer, index) => {
      const question = questions.find(q => q.id === answer.question);
      
      if (!question) return null;

      return {
        number: index + 1,
        questionId: question.id,
        text: question.text,
        type: question.type,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer: answer.selectedAnswer,
        isCorrect: answer.isCorrect,
        explanation: question.explanation,
        topic: question.topic,
        difficulty: question.difficulty,
        timeTaken: answer.timeTaken,
        flagged: answer.flagged,
        imageUrl: question.imageUrl
      };
    }).filter(Boolean);

    // Apply filter
    if (filterType === 'incorrect') {
      reviewData = reviewData.filter(q => !q.isCorrect && q.userAnswer);
    } else if (filterType === 'flagged') {
      reviewData = reviewData.filter(q => q.flagged);
    } else if (filterType === 'unanswered') {
      reviewData = reviewData.filter(q => !q.userAnswer);
    } else if (filterType === 'correct') {
      reviewData = reviewData.filter(q => q.isCorrect);
    }
    // 'all' returns everything (no filter)

    res.status(200).json({
      success: true,
      data: {
        filter: filterType,
        count: reviewData.length,
        questions: reviewData
      }
    });

  } catch (error) {
    console.error('Error fetching filtered questions:', error);
    next(error);
  }
};