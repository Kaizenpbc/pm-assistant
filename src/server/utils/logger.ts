import winston from 'winston';

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'pm-application-v2' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Request logger middleware
export const requestLogger = (request: any, reply: any, done: any) => {
  logger.info('Request received', {
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers['user-agent']
  });
  done();
};

// Error logger
export const errorLogger = logger;

// Performance logger
export const performanceLogger = logger;

// Audit logger
export const auditLogger = logger;

export default logger;
