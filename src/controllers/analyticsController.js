const { Analytics, User } = require('../models');

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
      include: [{
        model: Test,
        as: 'test',
        include: [{
          model: Subject,
          as: 'subject',
          attributes: ['name', 'code', 'icon', 'color']
        }],
        attributes: ['id', 'title', 'type']
      }],
      order: [['completedAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: attempts
    });
  } catch (error) {
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