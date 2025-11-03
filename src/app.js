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

// ✅ Trust proxy - required when deploying to Netlify, Vercel, or behind a load balancer
app.set('trust proxy', true);

// CORS - More permissive during testing
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://ht-waec.netlify.app',  // Allow all origins during testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log('🔍 Request:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body
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

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: rateLimit.ipKeyGenerator,
  validate: {
    keyGeneratorIpFallback: false
  }
});

app.use('/api', limiter);  // Changed from '/api/' to apply globally after redirect strip

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WAEC CBT API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes (removed /api prefix to match post-redirect paths)
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/questions', questionRoutes);

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;