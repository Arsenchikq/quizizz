require('dotenv').config();
const express        = require('express');
const cors           = require('cors');
const connectDB      = require('./config/db');
const { logger, morganMiddleware } = require('./logger');

const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morganMiddleware);   // HTTP request logging

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/users', authRoutes);
app.use('/api/tests', testRoutes);

// Health check
app.get('/api/health', (req, res) => {
  logger.info('Health check called');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  logger.warn(`404 — ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Маршрут не найден' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(err.statusCode || 500).json({ message: err.message || 'Внутренняя ошибка сервера' });
});

// ── Connect DB → Start ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
  });
});
