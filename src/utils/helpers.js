// Calculate percentage
exports.calculatePercentage = (score, total) => {
  return Math.round((score / total) * 100);
};

// Calculate mastery level based on accuracy
exports.calculateMasteryLevel = (accuracy) => {
  if (accuracy >= 90) return 'expert';
  if (accuracy >= 75) return 'advanced';
  if (accuracy >= 60) return 'intermediate';
  return 'beginner';
};

// Generate random questions for a test
exports.generateTestQuestions = async (QuestionModel, subjectId, count, difficulty = 'mixed') => {
  const { Op } = require('sequelize');
  
  let where = { subjectId, isActive: true };
  
  if (difficulty !== 'mixed') {
    where.difficulty = difficulty;
  }
  
  const questions = await QuestionModel.findAll({
    where,
    order: require('sequelize').literal('RANDOM()'),
    limit: count
  });
  
  return questions;
};