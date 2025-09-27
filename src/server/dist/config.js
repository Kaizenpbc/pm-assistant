"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const configSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(3002),
    HOST: zod_1.z.string().default('localhost'),
    DB_HOST: zod_1.z.string().default('localhost'),
    DB_PORT: zod_1.z.coerce.number().default(3306),
    DB_USER: zod_1.z.string().default('root'),
    DB_PASSWORD: zod_1.z.string().default('rootpassword'),
    DB_NAME: zod_1.z.string().default('pm_application_v2'),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    COOKIE_SECRET: zod_1.z.string().min(32, 'COOKIE_SECRET must be at least 32 characters'),
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:3000'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
});
exports.config = configSchema.parse({
    NODE_ENV: process.env['NODE_ENV'],
    PORT: process.env['PORT'],
    HOST: process.env['HOST'],
    DB_HOST: process.env['DB_HOST'],
    DB_PORT: process.env['DB_PORT'],
    DB_USER: process.env['DB_USER'],
    DB_PASSWORD: process.env['DB_PASSWORD'],
    DB_NAME: process.env['DB_NAME'],
    JWT_SECRET: process.env['JWT_SECRET'],
    JWT_REFRESH_SECRET: process.env['JWT_REFRESH_SECRET'],
    COOKIE_SECRET: process.env['COOKIE_SECRET'],
    CORS_ORIGIN: process.env['CORS_ORIGIN'],
    LOG_LEVEL: process.env['LOG_LEVEL'],
});
//# sourceMappingURL=config.js.map