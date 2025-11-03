const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} = require('../validators/authValidators');



router.post('/register', registerValidator, validate, register);
router.post('/login', (req, res, next) => {
  // Pre-process the request body to handle both email and emailOrPhone
  if (req.body.email && !req.body.emailOrPhone) {
    req.body.emailOrPhone = req.body.email;
  }
  
  console.log('📝 Login attempt:', {
    rawBody: req.body,
    processedBody: {
      email: req.body.email,
      emailOrPhone: req.body.emailOrPhone,
      password: req.body.password ? '[REDACTED]' : undefined
    },
    headers: {
      'content-type': req.headers['content-type'],
      origin: req.headers.origin,
      host: req.headers.host,
      'user-agent': req.headers['user-agent']
    }
  });
  next();
}, loginValidator, validate, login);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.put('/reset-password/:resetToken', resetPasswordValidator, validate, resetPassword);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

module.exports = router;