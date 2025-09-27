"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = exports.performanceLogger = exports.errorLogger = exports.requestLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    defaultMeta: { service: 'pm-application-v2' },
    transports: [
        new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'logs/combined.log' }),
    ],
});
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
    }));
}
const requestLogger = (request, reply, done) => {
    logger.info('Request received', {
        method: request.method,
        url: request.url,
        ip: request.ip,
        userAgent: request.headers['user-agent']
    });
    done();
};
exports.requestLogger = requestLogger;
exports.errorLogger = logger;
exports.performanceLogger = logger;
exports.auditLogger = logger;
exports.default = logger;
//# sourceMappingURL=logger.js.map