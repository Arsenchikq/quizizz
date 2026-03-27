const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper ────────────────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const userResponse = (user) => ({
  id:       user._id,
  name:     user.name,
  email:    user.email,
  username: user.name,
  role:     user.role,
  avatar:   `https://ui-avatars.com/api/?background=0A0A0A&color=fff&name=${encodeURIComponent(user.name)}`,
});
  
// ── POST /api/users/register ──────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Заполните все поля' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email уже занят' });
    }

    const user  = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({ token, user: userResponse(user) });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ── POST /api/users/login ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Введите email и пароль' });
    }

    // select('+password') — поле скрыто по умолчанию в схеме
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const token = signToken(user._id);
    res.json({ token, user: userResponse(user) });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ── GET /api/users/me ─────────────────────────────────────────────────────────
exports.getMe = (req, res) => {
  res.json({ user: userResponse(req.user) });
};

// ── PATCH /api/users/me ───────────────────────────────────────────────────────
exports.updateMe = async (req, res) => {
  try {
    const allowed = ['name', 'bio'];
    const updates = {};
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new:           true,
      runValidators: true,
    });

    res.json({ user: userResponse(user) });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ── PATCH /api/users/password ─────────────────────────────────────────────────
exports.updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Пароль минимум 6 символов' });
    }

    const user = await User.findById(req.user._id).select('+password');
    user.password = password;
    await user.save(); // bcrypt pre-save hook

    res.json({ message: 'Пароль успешно обновлён' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
