const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');  // Import for IPv6 fix

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

// Trust proxy - set to 1 for Vercel (single proxy layer)
app.set('trust proxy', 1);

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

// Rate limiting - FIXED with ipKeyGenerator for IPv6
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => {
    return req.path === '/health' || 
           req.path === '/api/health' || 
           req.path === '/' ||
           req.path === '/api/db-test';
  },
  // Fixed keyGenerator: Use x-forwarded-for with ipKeyGenerator for IPv6 safety
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
               req.headers['x-real-ip'] ||
               req.connection.remoteAddress ||
               req.ip ||
               'unknown';
    return ipKeyGenerator(ip);  // Handles IPv6 subnets
  }
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
console.log('🔧 Setting up API routes...');
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/questions', questionRoutes);
console.log('✅ API routes configured');

// Catch-all for unsupported methods on valid paths - FIXED with :path*
app.all('/api/auth/:path*', (req, res, next) => {
  if (req.method === 'GET' && req.path !== '/api/auth/me') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed',
      hint: `${req.path} does not support GET requests. Available methods: POST`,
      availableEndpoints: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login',
        'POST /api/auth/forgot-password': 'Request password reset',
        'PUT /api/auth/reset-password/:token': 'Reset password',
        'GET /api/auth/me': 'Get current user (requires auth)'
      }
    });
  }
  next();
});

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