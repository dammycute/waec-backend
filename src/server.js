require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

// Check if running on Vercel (serverless)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;

let dbInitialized = false;
let initPromise = null;

const initDatabase = async () => {
  // Return existing promise if already initializing
  if (initPromise) return initPromise;
  
  if (dbInitialized) return Promise.resolve();
  
  initPromise = (async () => {
    try {
      console.log('🔌 Attempting database connection...');
      console.log('DB Config:', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER ? '***' : 'NOT SET'
      });

      await sequelize.authenticate();
      console.log('✅ Database connection established');
      
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized');
      }
      
      dbInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Database connection error:', error.message);
      console.error('Full error:', error);
      throw error; // Throw so we can catch and return proper error response
    }
  })();
  
  return initPromise;
};

// For Vercel serverless
if (isVercel) {
  console.log('🚀 Running in Vercel serverless mode');
  
  module.exports = async (req, res) => {
    console.log('📡 Vercel Function called:', {
      method: req.method,
      url: req.url,
      path: req.path
    });

    // Health checks don't need DB
    const isHealthCheck = req.url === '/health' || 
                         req.url === '/api/health' || 
                         req.url === '/' ||
                         req.url === '';

    if (!isHealthCheck) {
      try {
        await initDatabase();
        console.log('✅ Database ready for request');
      } catch (error) {
        console.error('❌ Database init failed for request:', error.message);
        return res.status(503).json({
          success: false,
          message: 'Database connection failed',
          error: error.message,
          hint: 'Check your environment variables in Vercel dashboard'
        });
      }
    }

    return app(req, res);
  };
} else {
  // For local development
  const startServer = async () => {
    try {
      await initDatabase();
      
      app.listen(PORT, () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
        console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      });
    } catch (error) {
      console.error('❌ Unable to start server:', error);
      process.exit(1);
    }
  };

  startServer();

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message);
    process.exit(1);
  });
}