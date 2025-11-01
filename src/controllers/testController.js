const { Test, TestAttempt, Question, Subject, Analytics, User } = require('../models');
const { Op } = require('sequelize');
const { calculatePercentage } = require('../utils/helpers');
const { sequelize } = require('../models');


// @desc    Get all tests
// @route   GET /api/tests
// @access  Private

exports.generateTest = async (req, res, next) => {
  try {
    const { subjectId, type, questionCount, difficulty } = req.body;

    if (!subjectId || !type || !questionCount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject, type, and question count'
      });
    }

    if (type === 'mock' && req.user.subscriptionPlan === 'free') {
      return res.status(403).json({
        success: false,
        message: 'Upgrade to premium to access mock exams'
      });
    }

    const durations = { quick: 30, subject: 60, mock: 180 };
    const duration = durations[type] || 60;

    const where = { subjectId, isActive: true, type: 'multiple-choice' };
    if (difficulty && difficulty !== 'mixed') where.difficulty = difficulty;

    const questions = await Question.findAll({
      where,
      order: sequelize.literal('RANDOM()'), // ✅ now works
      limit: parseInt(questionCount),
      attributes: { exclude: ['correctAnswer', 'explanation', 'createdBy'] }
    });

    if (questions.length < questionCount) {
      return res.status(400).json({
        success: false,
        message: `Only ${questions.length} questions available. Please select fewer questions.`
      });
    }

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const subject = await Subject.findByPk(subjectId);

    res.status(200).json({
      success: true,
      data: {
        id: `dynamic-${Date.now()}`,
        title: `${subject.name} ${type.charAt(0).toUpperCase() + type.slice(1)} Test`,
        subject: {
          id: subject.id,
          name: subject.name,
          code: subject.code,
          icon: subject.icon,
          color: subject.color
        },
        type,
        duration,
        totalQuestions: questions.length,
        totalPoints,
        difficulty: difficulty || 'mixed',
        questions: questions.map(q => ({
          id: q.id,
          text: q.text,
          type: q.type,
          options: q.options,
          topic: q.topic,
          difficulty: q.difficulty,
          points: q.points,
          imageUrl: q.imageUrl
        })),
        instructions: `This is a ${type} test for ${subject.name}. Answer all questions to the best of your ability. Good luck!`,
        startTime: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get all tests
// @route   GET /api/tests
// @access  Private
exports.getTests = async (req, res, next) => {
  try {
    const tests = await Test.findAll({
      include: [{ model: Subject, as: 'subject', attributes: ['name', 'code'] }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single test by ID
// @route   GET /api/tests/:id
// @access  Private
exports.getTest = async (req, res, next) => {
  try {
    const test = await Test.findByPk(req.params.id, {
      include: [{ model: Subject, as: 'subject', attributes: ['name', 'code'] }]
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    res.status(200).json({
      success: true,
      data: test
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Create test
// @route   POST /api/tests
// @access  Private (Admin/Teacher)
exports.createTest = async (req, res, next) => {
  try {
    const { title, subject, type, questionCount, duration, difficulty } = req.body;

    // Generate questions
    const { generateTestQuestions } = require('../utils/helpers');
    const questions = await generateTestQuestions(Question, subject, questionCount, difficulty);

    if (questions.length < questionCount) {
      return res.status(400).json({
        success: false,
        message: 'Not enough questions available'
      });
    }

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    const test = await Test.create({
      title,
      subjectId: subject,
      type,
      questions: questions.map(q => q.id),
      duration,
      totalQuestions: questionCount,
      totalPoints,
      difficulty,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: test
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start test
// @route   POST /api/tests/:id/start
// @access  Private
exports.startTest = async (req, res, next) => {
  try {
    const test = await Test.findByPk(req.params.id, {
      include: [{
        model: Subject,
        as: 'subject',
        attributes: ['name', 'code']
      }]
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check subscription for premium tests
    if (test.type === 'mock' && req.user.subscriptionPlan === 'free') {
      return res.status(403).json({
        success: false,
        message: 'Upgrade to premium to access mock exams'
      });
    }

    // Get questions without answers
    const questions = await Question.findAll({
      where: {
        id: { [Op.in]: test.questions }
      },
      attributes: { exclude: ['correctAnswer', 'explanation'] }
    });

    res.status(200).json({
      success: true,
      data: {
        test: {
          ...test.toJSON(),
          questions
        },
        startTime: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Generate dynamic test
// @route   POST /api/tests/generate
// @access  Private
exports.generateTest = async (req, res, next) => {
  try {
    const { subjectId, type, questionCount, difficulty } = req.body;

    // Validate input
    if (!subjectId || !type || !questionCount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject, type, and question count'
      });
    }

    // Check subscription for mock exams
    if (type === 'mock' && req.user.subscriptionPlan === 'free') {
      return res.status(403).json({
        success: false,
        message: 'Upgrade to premium to access mock exams'
      });
    }

    // Set duration based on test type
    const durations = {
      quick: 30,
      subject: 60,
      mock: 180
    };
    const duration = durations[type] || 60;

    // Get questions
    let where = { 
      subjectId, 
      isActive: true,
      type: 'multiple-choice' // Only MCQ for now
    };
    
    if (difficulty && difficulty !== 'mixed') {
      where.difficulty = difficulty;
    }

    const questions = await Question.findAll({
      where,
      order: sequelize.literal('RANDOM()'),
      limit: parseInt(questionCount),
      attributes: { exclude: ['correctAnswer', 'explanation', 'createdBy'] }
    });

    if (questions.length < questionCount) {
      return res.status(400).json({
        success: false,
        message: `Only ${questions.length} questions available. Please select fewer questions.`
      });
    }

    // Calculate total points
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    // Get subject details
    const subject = await Subject.findByPk(subjectId);

    res.status(200).json({
      success: true,
      data: {
        id: `dynamic-${Date.now()}`, // Temporary ID for dynamic tests
        title: `${subject.name} ${type.charAt(0).toUpperCase() + type.slice(1)} Test`,
        subject: {
          id: subject.id,
          name: subject.name,
          code: subject.code,
          icon: subject.icon,
          color: subject.color
        },
        type,
        duration,
        totalQuestions: questions.length,
        totalPoints,
        difficulty: difficulty || 'mixed',
        questions: questions.map(q => ({
          id: q.id,
          text: q.text,
          type: q.type,
          options: q.options,
          topic: q.topic,
          difficulty: q.difficulty,
          points: q.points,
          imageUrl: q.imageUrl
        })),
        instructions: `This is a ${type} test for ${subject.name}. Answer all questions to the best of your ability. Good luck!`,
        startTime: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};



// @desc    Submit test
// @route   POST /api/tests/:id/submit
// @access  Private
exports.submitTest = async (req, res, next) => {
  try {
    const { answers, startTime, endTime, testData } = req.body;
    
    // For dynamic tests, testData will be provided in the request
    let test = await Test.findByPk(req.params.id);
    let isDynamicTest = false;

    if (!test && testData) {
      // This is a dynamic test
      isDynamicTest = true;
      test = {
        id: testData.id,
        subjectId: testData.subject.id,
        type: testData.type,
        questions: testData.questions.map(q => q.id),
        totalQuestions: testData.totalQuestions,
        totalPoints: testData.totalPoints
      };
    } else if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Get all questions with correct answers
    const questions = await Question.findAll({
      where: {
        id: { [Op.in]: test.questions }
      }
    });

    // Calculate results
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unanswered = 0;
    const topicPerformance = {};

    const processedAnswers = answers.map(answer => {
      const question = questions.find(q => q.id === answer.question);
      
      if (!question) return null;

      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      
      if (!answer.selectedAnswer) {
        unanswered++;
      } else if (isCorrect) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }

      // Track topic performance
      if (!topicPerformance[question.topic]) {
        topicPerformance[question.topic] = { attempted: 0, correct: 0 };
      }
      topicPerformance[question.topic].attempted++;
      if (isCorrect) topicPerformance[question.topic].correct++;

      // Update question statistics (only for non-dynamic tests)
      if (!isDynamicTest) {
        question.usageCount++;
        if (isCorrect) question.correctCount++;
        question.save();
      }

      return {
        question: question.id,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeTaken: answer.timeTaken || 0,
        flagged: answer.flagged || false
      };
    }).filter(Boolean);

    const score = correctAnswers;
    const percentage = calculatePercentage(correctAnswers, test.totalQuestions);
    const timeTaken = Math.floor((new Date(endTime) - new Date(startTime)) / 1000 / 60);

    // Format topic performance
    const topicPerformanceArray = Object.entries(topicPerformance).map(([topic, data]) => ({
      topic,
      attempted: data.attempted,
      correct: data.correct,
      percentage: calculatePercentage(data.correct, data.attempted)
    }));

    // Save test attempt
    const testAttempt = await TestAttempt.create({
      userId: req.user.id,
      testId: isDynamicTest ? null : test.id,
      answers: processedAnswers,
      score,
      percentage,
      totalQuestions: test.totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unanswered,
      timeTaken,
      startedAt: startTime,
      completedAt: endTime,
      status: 'completed',
      topicPerformance: topicPerformanceArray
    });

    // Update user analytics (same as before)
    const analytics = await Analytics.findOne({ where: { userId: req.user.id } });
    if (analytics) {
      const newTotalTests = analytics.totalTests + 1;
      const newAverageScore = ((analytics.averageScore * analytics.totalTests) + percentage) / newTotalTests;
      
      await analytics.update({
        totalTests: newTotalTests,
        averageScore: newAverageScore,
        totalStudyTime: analytics.totalStudyTime + timeTaken,
        lastStudyDate: new Date()
      });

      // Update streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastStudy = analytics.lastStudyDate ? new Date(analytics.lastStudyDate) : null;
      
      if (lastStudy) {
        lastStudy.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          const newStreak = analytics.currentStreak + 1;
          await analytics.update({
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, analytics.longestStreak)
          });
        } else if (diffDays > 1) {
          await analytics.update({ currentStreak: 1 });
        }
      } else {
        await analytics.update({ currentStreak: 1 });
      }

      // Update subject performance
      const subjectPerf = analytics.subjectPerformance || [];
      const subjectIndex = subjectPerf.findIndex(s => s.subjectId === test.subjectId);
      
      if (subjectIndex > -1) {
        const current = subjectPerf[subjectIndex];
        subjectPerf[subjectIndex] = {
          subjectId: test.subjectId,
          totalTests: current.totalTests + 1,
          averageScore: ((current.averageScore * current.totalTests) + percentage) / (current.totalTests + 1),
          lastTested: new Date()
        };
      } else {
        subjectPerf.push({
          subjectId: test.subjectId,
          totalTests: 1,
          averageScore: percentage,
          lastTested: new Date()
        });
      }

      await analytics.update({ subjectPerformance: subjectPerf });

      // Update weaknesses (topics below 60%)
      const weakTopics = topicPerformanceArray
        .filter(t => t.percentage < 60)
        .map(t => t.topic);
      
      if (weakTopics.length > 0) {
        const currentWeaknesses = analytics.weaknesses || [];
        const updatedWeaknesses = [...new Set([...currentWeaknesses, ...weakTopics])];
        await analytics.update({ weaknesses: updatedWeaknesses.slice(0, 10) });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        attemptId: testAttempt.id,
        score,
        percentage,
        correctAnswers,
        incorrectAnswers,
        unanswered,
        timeTaken,
        topicPerformance: topicPerformanceArray
      }
    });
  } catch (error) {
    next(error);
  }
};