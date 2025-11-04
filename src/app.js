const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const analyticsRoutes = require('./routes/analytics');
const resultRoutes = require('./routes/results');
const errorHandler = require('./middleware/errorHandler');
const subjectRoutes = require('./routes/subjects');
const questionRoutes = require('./routes/questions');

const app = express();

// Security middleware
app.use(helmet());

// Trust proxy
app.set('trust proxy', true);

// CORS - allow all origins for now to debug
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Debug middleware - log ALL requests
app.use((req, res, next) => {
  console.log('📥 Request:', {
    method: req.method,
    url: req.url,
    path: req.path,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    headers: {
      host: req.headers.host,
      'user-agent': req.headers['user-agent']
    }
  });
  next();
});

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/api/health'
});

app.use(limiter);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WAEC CBT API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    routes: {
      health: '/health or /api/health',
      dbTest: '/api/db-test',
      auth: '/api/auth/*',
      tests: '/api/tests/*',
      subjects: '/api/subjects/*',
      questions: '/api/questions/*',
      analytics: '/api/analytics/*',
      results: '/api/results/*'
    }
  });
});

// Health check endpoints
app.get('/health', (req, res) => {
  console.log('✅ Health check hit at /health');
  res.status(200).json({
    success: true,
    message: 'WAEC CBT API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    uptime: process.uptime()
  });
});

app.get('/api/health', (req, res) => {
  console.log('✅ Health check hit at /api/health');
  res.status(200).json({
    success: true,
    message: 'WAEC CBT API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    uptime: process.uptime()
  });
});

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
  console.log('🔍 Database test endpoint hit');
  try {
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    
    // Try to count users
    const { User } = require('./models');
    const userCount = await User.count();
    
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      database: {
        connected: true,
        userCount: userCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/questions', questionRoutes);

// Error handler
app.use(errorHandler);

// 404 handler - MUST be last
app.use((req, res) => {
  console.log('❌ 404 Not Found:', {
    url: req.url,
    path: req.path,
    method: req.method
  });
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedPath: req.url,
    availableRoutes: [
      '/ (root)',
      '/health',
      '/api/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/tests/generate',
      '/api/subjects',
      '/api/questions',
      '/api/analytics/me',
      '/api/results/my-results'
    ]
  });
});

module.exports = app;