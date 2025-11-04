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
  console.log('🔍 Vercel incoming:', { 
    method: req.method, 
    url: req.url, 
    originalUrl: req.url,
    headers: {
      host: req.headers.host,
      'x-forwarded-proto': req.headers['x-forwarded-proto']
    }
  });

  // Handle health check FIRST before DB init
  if (req.url === '/health' || req.url === '/api/health') {
    console.log('✅ Health check hit');
    return res.status(200).json({
      success: true,
      message: 'WAEC CBT API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production'
    });
  }

  // Initialize DB for other routes
  try {
    await init();
  } catch (err) {
    console.error('DB Init Error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Database initialization error',
      error: err.message 
    });
  }

  // Normalize the path to ensure /api prefix
  let normalizedUrl = req.url;
  
  // If URL doesn't start with /api, add it
  if (!normalizedUrl.startsWith('/api')) {
    normalizedUrl = `/api${normalizedUrl}`;
  }
  
  // Update request URL for Express
  req.url = normalizedUrl;

  console.log('📍 Normalized URL:', normalizedUrl);

  // Forward to Express app
  return app(req, res);
};