// src/migrations/YYYYMMDDHHMMSS-fix-test-attempt-testid.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change testId to allow NULL for dynamic tests
    await queryInterface.changeColumn('test_attempts', 'testId', {
      type: Sequelize.UUID,
      allowNull: true,  // Allow NULL for dynamic tests
      references: {
        model: 'tests',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to NOT NULL if needed
    await queryInterface.changeColumn('test_attempts', 'testId', {
      type: Sequelize.UUID,
      allowNull: false,  // Original constraint
      references: {
        model: 'tests',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }
};