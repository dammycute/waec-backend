require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

// Check if running on Vercel (serverless)
const isVercel = process.env.VERCEL === '1';

let dbInitialized = false;

const initDatabase = async () => {
  if (dbInitialized) return;
  
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized');
    }
    
    dbInitialized = true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    // Don't throw - allow app to start without DB for health checks
  }
};

// For Vercel serverless
if (isVercel) {
  console.log('🚀 Running in Vercel serverless mode');
  
  module.exports = async (req, res) => {
    console.log('📡 Vercel Function called:', {
      method: req.method,
      url: req.url
    });

    // Initialize DB only if not a health check
    if (req.url !== '/health' && req.url !== '/api/health' && req.url !== '/') {
      await initDatabase();
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