const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions
  }
);

const db = {
  sequelize,
  Sequelize,
  User: require('./User')(sequelize, Sequelize),
  Subject: require('./Subject')(sequelize, Sequelize),
  Question: require('./Question')(sequelize, Sequelize),
  Test: require('./Test')(sequelize, Sequelize),
  TestAttempt: require('./TestAttempt')(sequelize, Sequelize),
  Analytics: require('./Analytics')(sequelize, Sequelize),
  Notification: require('./Notification')(sequelize, Sequelize)
};

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;