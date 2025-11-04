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
  // Log incoming request for debugging
  console.log('Vercel incoming:', { method: req.method, url: req.url, path: req.url });
  try {
    await init();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database initialization error' });
  }

  // Vercel may pass the path without the /api prefix for files depending on routing.
  // Ensure the request path starts with /api so your Express routes (mounted on /api) match.
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }

  // Express app is a request handler; forward request to it
  return app(req, res);
};
