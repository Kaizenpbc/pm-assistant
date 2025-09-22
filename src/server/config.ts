import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3002),
  HOST: z.string().default('localhost'),
  
  // Database - MySQL
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default('rootpassword'),
  DB_NAME: z.string().default('pm_application_v2'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  
  // Cookies
  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 characters'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
});

export const config = configSchema.parse({
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
