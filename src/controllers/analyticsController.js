// src/controllers/analyticsController.js - Fixed with proper subject loading
const { Analytics, User, TestAttempt, Test, Subject } = require('../models');

// @desc    Get user's analytics
// @route   GET /api/analytics/me
// @access  Private
exports.getMyAnalytics = async (req, res, next) => {
  try {
    let analytics = await Analytics.findOne({ 
      where: { userId: req.user.id } 
    });

    // If analytics don't exist, create them
    if (!analytics) {
      analytics = await Analytics.create({
        userId: req.user.id
      });
    }

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get subject performance
// @route   GET /api/analytics/subject-performance
// @access  Private
exports.getSubjectPerformance = async (req, res, next) => {
  try {
    const analytics = await Analytics.findOne({ 
      where: { userId: req.user.id } 
    });

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics not found'
      });
    }

    res.status(200).json({
      success: true,
      data: analytics.subjectPerformance || []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent tests
// @route   GET /api/analytics/recent-tests
// @access  Private
exports.getRecentTests = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    
    const attempts = await TestAttempt.findAll({
      where: { 
        userId: req.user.id,
        status: 'completed'
      },
      include: [
        {
          model: Test,
          as: 'test',
          required: false, // LEFT JOIN for dynamic tests
          include: [{
            model: Subject,
            as: 'subject',
            attributes: ['id', 'name', 'code', 'icon', 'color']
          }],
          attributes: ['id', 'title', 'type', 'subjectId']
        }
      ],
      order: [['completedAt', 'DESC']],
      limit: parseInt(limit)
    });

    console.log('📊 Found test attempts:', attempts.length);

    // Enrich attempts with subject data from testMetadata if needed
    const enrichedAttempts = await Promise.all(attempts.map(async (attempt) => {
      const attemptData = attempt.toJSON();
      
      // If test exists and has subject, we're good
      if (attemptData.test && attemptData.test.subject) {
        console.log('✅ Test has subject:', attemptData.test.subject.name);
        return attemptData;
      }
      
      // For dynamic tests, try to get subject from testMetadata
      if (attemptData.testMetadata && attemptData.testMetadata.subjectId) {
        console.log('🔍 Loading subject from testMetadata:', attemptData.testMetadata.subjectId);
        const subject = await Subject.findByPk(attemptData.testMetadata.subjectId);
        if (subject) {
          // Add subject to test structure
          attemptData.test = {
            ...attemptData.test,
            subject: {
              id: subject.id,
              name: subject.name,
              code: subject.code,
              icon: subject.icon,
              color: subject.color
            }
          };
          console.log('✅ Added subject from metadata:', subject.name);
        }
      }
      
      return attemptData;
    }));

    res.status(200).json({
      success: true,
      data: enrichedAttempts
    });
  } catch (error) {
    console.error('❌ Error in getRecentTests:', error);
    next(error);
  }
};

// @desc    Get topic mastery
// @route   GET /api/analytics/topic-mastery
// @access  Private
exports.getTopicMastery = async (req, res, next) => {
  try {
    const analytics = await Analytics.findOne({ 
      where: { userId: req.user.id } 
    });

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics not found'
      });
    }

    res.status(200).json({
      success: true,
      data: analytics.topicMastery || []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly progress
// @route   GET /api/analytics/weekly-progress
// @access  Private
exports.getWeeklyProgress = async (req, res, next) => {
  try {
    const { weeks = 4 } = req.query;
    
    const analytics = await Analytics.findOne({ 
      where: { userId: req.user.id } 
    });

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics not found'
      });
    }

    const weeklyProgress = analytics.weeklyProgress || [];
    const recentProgress = weeklyProgress.slice(-parseInt(weeks));

    res.status(200).json({
      success: true,
      data: recentProgress
    });
  } catch (error) {
    next(error);
  }
};