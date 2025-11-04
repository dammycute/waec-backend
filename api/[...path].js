require('dotenv').config();
const app = require('../src/app');
const { sequelize } = require('../src/models');

let initialized = false;
const init = async () => {
  if (initialized) return;
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
    }
    initialized = true;
    console.log('✅ Sequelize initialized (Vercel warm start)');
  } catch (err) {
    console.error('❌ Sequelize init error:', err);
    throw err;
  }
};

module.exports = async (req, res) => {
  try {
    await init();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database initialization error' });
  }

  // Express app is a request handler; forward request to it
  return app(req, res);
};
