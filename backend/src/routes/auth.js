const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// SMS login
router.post('/send-sms', authController.sendSmsCode);
router.post('/verify-sms', authController.verifySmsCode);
router.post('/phone-register', authController.phoneRegister);

// Password reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// OAuth (placeholders)
router.post('/oauth/:provider', authController.oauthAuthorize);
router.post('/oauth/:provider/callback', authController.oauthCallback);

// Protected routes
router.get('/me', authenticate, authController.me);

module.exports = router;
