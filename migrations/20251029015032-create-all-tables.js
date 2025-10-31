'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // All table creation will happen through sync
    // This is just for tracking
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('analytics');
    await queryInterface.dropTable('test_attempts');
    await queryInterface.dropTable('tests');
    await queryInterface.dropTable('questions');
    await queryInterface.dropTable('subjects');
    await queryInterface.dropTable('users');
  }
};