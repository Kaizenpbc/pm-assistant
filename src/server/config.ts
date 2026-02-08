import { z } from 'zod';

// Enhanced configuration schema with better validation
const configSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().min(1000, 'PORT must be at least 1000').max(65535, 'PORT must be at most 65535').default(3001),
  HOST: z.string().min(1, 'HOST cannot be empty').default('localhost'),
  
  // Database - MySQL
  DB_HOST: z.string().min(1, 'DB_HOST cannot be empty').default('localhost'),
  DB_PORT: z.coerce.number().min(1, 'DB_PORT must be at least 1').max(65535, 'DB_PORT must be at most 65535').default(3306),
  DB_USER: z.string().min(1, 'DB_USER cannot be empty').default('root'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD cannot be empty').default('rootpassword'),
  DB_NAME: z.string().min(1, 'DB_NAME cannot be empty').default('pm_application_v2'),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters for security'),
  
  // Cookie Configuration
  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 characters for security'),
  
  // CORS Configuration
  CORS_ORIGIN: z.string().url('CORS_ORIGIN must be a valid URL').default('http://localhost:5173'),
  
  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('debug'),

  // AI Configuration
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required for AI features').optional(),
  AI_MODEL: z.string().default('claude-sonnet-4-5-20250929'),
  AI_MAX_TOKENS: z.coerce.number().min(256).max(16384).default(4096),
  AI_TEMPERATURE: z.coerce.number().min(0).max(1).default(0.3),
  AI_ENABLED: z.enum(['true', 'false']).default('true').transform(v => v === 'true'),

  // Weather API Configuration
  WEATHER_API_PROVIDER: z.enum(['openweathermap', 'weatherapi', 'accuweather', 'mock']).default('mock'),
  WEATHER_API_KEY: z.string().optional(),
  WEATHER_CACHE_MINUTES: z.coerce.number().min(1).max(1440).default(60),
}).refine((data) => {
  // Additional validation: ensure secrets are different
  if (data.JWT_SECRET === data.JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different');
  }
  if (data.JWT_SECRET === data.COOKIE_SECRET) {
    throw new Error('JWT_SECRET and COOKIE_SECRET must be different');
  }
  if (data.JWT_REFRESH_SECRET === data.COOKIE_SECRET) {
    throw new Error('JWT_REFRESH_SECRET and COOKIE_SECRET must be different');
  }
  return true;
}, {
  message: 'Security secrets must be unique'
});

// Configuration validation function
export function validateConfiguration() {
  try {
    const rawConfig = {
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
      ANTHROPIC_API_KEY: process.env['ANTHROPIC_API_KEY'],
      AI_MODEL: process.env['AI_MODEL'],
      AI_MAX_TOKENS: process.env['AI_MAX_TOKENS'],
      AI_TEMPERATURE: process.env['AI_TEMPERATURE'],
      AI_ENABLED: process.env['AI_ENABLED'],
      WEATHER_API_PROVIDER: process.env['WEATHER_API_PROVIDER'],
      WEATHER_API_KEY: process.env['WEATHER_API_KEY'],
      WEATHER_CACHE_MINUTES: process.env['WEATHER_CACHE_MINUTES'],
    };

    console.log('🔍 Validating configuration...');
    
    // Check for missing required environment variables
    const requiredVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'COOKIE_SECRET'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Validate using Zod schema
    const validatedConfig = configSchema.parse(rawConfig);
    
    console.log('✅ Configuration validation successful');
    return validatedConfig;
  } catch (error) {
    console.error('❌ Configuration validation failed:');
    
    if (error instanceof z.ZodError) {
      console.error('Validation errors:');
      error.issues.forEach((issue: z.ZodIssue, index: number) => {
        const path = issue.path.length ? issue.path.join('.') : '(root)';
        console.error(`  ${index + 1}. ${path}: ${issue.message}`);
      });
    } else {
      console.error(`  ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    console.error('\n💡 To fix configuration issues:');
    console.error('  1. Check your .env file exists and has all required variables');
    console.error('  2. Ensure JWT and cookie secrets are at least 32 characters');
    console.error('  3. Verify all secrets are unique (not the same value)');
    console.error('  4. Check that URLs and ports are valid');
    
    throw new Error('Configuration validation failed');
  }
}

// Parse and export configuration
export const config = validateConfiguration();
