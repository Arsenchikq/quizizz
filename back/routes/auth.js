const express = require('express');
const auth    = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  updateMe,
  updatePassword,
} = require('../controllers/authController');

const router = express.Router();

// Публичные маршруты
router.post('/register', register);
router.post('/login',    login);

// Защищённые маршруты (требуется JWT)
router.get   ('/me',       auth, getMe);
router.patch ('/me',       auth, updateMe);
router.patch ('/password', auth, updatePassword);

module.exports = router;
