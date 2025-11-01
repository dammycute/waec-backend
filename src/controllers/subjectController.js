// Create src/controllers/subjectController.js
const { Subject, Question } = require('../models');

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