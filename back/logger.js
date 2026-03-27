const { createLogger, format, transports } = require('winston');
const morgan = require('morgan');
const path   = require('path');
const fs     = require('fs');

// Создать папку logs если нет
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

// Winston logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.File({ filename: path.join(logsDir, 'error.log'),    level: 'error' }),
    new transports.File({ filename: path.join(logsDir, 'combined.log') }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const extra = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
          return `${timestamp} [${level}]: ${message}${extra}`;
        })
      )
    })
  ]
});

// Morgan middleware (HTTP request logging)
const morganMiddleware = morgan(
  ':method :url :status :res[content-length]б - :response-time ms',
  {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  }
);

module.exports = { logger, morganMiddleware };
