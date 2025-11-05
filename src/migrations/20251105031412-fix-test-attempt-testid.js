// src/migrations/YYYYMMDDHHMMSS-add-test-metadata.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Make testId nullable
    await queryInterface.changeColumn('test_attempts', 'testId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'tests',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add testMetadata column for dynamic tests
    await queryInterface.addColumn('test_attempts', 'testMetadata', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: null,
      comment: 'Stores test details for dynamic tests without testId'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove testMetadata column
    await queryInterface.removeColumn('test_attempts', 'testMetadata');

    // Make testId NOT NULL again
    await queryInterface.changeColumn('test_attempts', 'testId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'tests',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }
};