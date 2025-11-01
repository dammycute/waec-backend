// Create src/controllers/subjectController.js
const { Subject, Question } = require('../models');
const { Op } = require('sequelize');


exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'code', 'description', 'icon', 'color', 'topics']
    });

    // Add question count for each subject
    const subjectsWithCounts = await Promise.all(
      subjects.map(async (subject) => {
        const questionCount = await Question.count({
          where: { subjectId: subject.id, isActive: true }
        });
        return {
          ...subject.toJSON(),
          questionCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: subjectsWithCounts
    });
  } catch (error) {
    next(error);
  }
};

exports.getSubjectTopics = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        subject: subject.name,
        topics: subject.topics
      }
    });
  } catch (error) {
    next(error);
  }
};


// const { Subject, Question } = require('../models');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
exports.getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'code', 'description', 'icon', 'color', 'topics'],
      order: [['name', 'ASC']]
    });

    // Add question count for each subject
    const subjectsWithCount = await Promise.all(
      subjects.map(async (subject) => {
        const questionCount = await Question.count({
          where: { subjectId: subject.id, isActive: true }
        });
        
        return {
          ...subject.toJSON(),
          questionCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: subjectsWithCount.length,
      data: subjectsWithCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Public
exports.getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Get question count
    const questionCount = await Question.count({
      where: { subjectId: subject.id, isActive: true }
    });

    // Get topics with question counts
    const topicsWithCounts = await Promise.all(
      subject.topics.map(async (topic) => {
        const topicQuestionCount = await Question.count({
          where: { 
            subjectId: subject.id, 
            topic: topic.name,
            isActive: true 
          }
        });
        
        return {
          ...topic,
          questionCount: topicQuestionCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        ...subject.toJSON(),
        questionCount,
        topics: topicsWithCounts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private (Admin only)
exports.createSubject = async (req, res, next) => {
  try {
    const { name, code, description, icon, color, topics } = req.body;

    // Check if subject already exists
    const existingSubject = await Subject.findOne({
      where: {
        [Op.or]: [{ name }, { code }]
      }
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this name or code already exists'
      });
    }

    const subject = await Subject.create({
      name,
      code,
      description,
      icon: icon || 'book',
      color: color || '#3B82F6',
      topics: topics || [],
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin only)
exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const { name, code, description, icon, color, topics, isActive } = req.body;

    await subject.update({
      name: name || subject.name,
      code: code || subject.code,
      description: description || subject.description,
      icon: icon || subject.icon,
      color: color || subject.color,
      topics: topics || subject.topics,
      isActive: isActive !== undefined ? isActive : subject.isActive
    });

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin only)
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Soft delete by setting isActive to false
    await subject.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};