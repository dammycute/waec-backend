const serverless = require('serverless-http');
require('dotenv').config();

// Import the Express app (does not start listening)
const app = require('../../src/app');

// Ensure Sequelize is initialized so models are available
const { sequelize } = require('../../src/models');

let connectionPromise;

// Initialize DB connection once per lambda/container warm start
const init = async () => {
  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        await sequelize.authenticate();
        // Do not sync in production; migrations should be used
        if (process.env.NODE_ENV === 'development') {
          await sequelize.sync({ alter: true });
        }
        console.log('✅ Database connected (Netlify function warm start)');
      } catch (err) {
        console.error('❌ DB connection error in Netlify function:', err);
        throw err;
      }
    })();
  }
  return connectionPromise;
};

const handler = async (event, context) => {
  // Wait for DB initialization before handling request
  await init();
  return serverless(app)(event, context);
};

module.exports.handler = handler;
