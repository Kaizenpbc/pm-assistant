"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.validateConfiguration = validateConfiguration;
const zod_1 = require("zod");
const configSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().min(1000, 'PORT must be at least 1000').max(65535, 'PORT must be at most 65535').default(3001),
    HOST: zod_1.z.string().min(1, 'HOST cannot be empty').default('localhost'),
    DB_HOST: zod_1.z.string().min(1, 'DB_HOST cannot be empty').default('localhost'),
    DB_PORT: zod_1.z.coerce.number().min(1, 'DB_PORT must be at least 1').max(65535, 'DB_PORT must be at most 65535').default(3306),
    DB_USER: zod_1.z.string().min(1, 'DB_USER cannot be empty').default('root'),
    DB_PASSWORD: zod_1.z.string().min(1, 'DB_PASSWORD cannot be empty').default('rootpassword'),
    DB_NAME: zod_1.z.string().min(1, 'DB_NAME cannot be empty').default('pm_application_v2'),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters for security'),
    COOKIE_SECRET: zod_1.z.string().min(32, 'COOKIE_SECRET must be at least 32 characters for security'),
    CORS_ORIGIN: zod_1.z.string().url('CORS_ORIGIN must be a valid URL').default('http://localhost:5173'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('debug'),
}).refine((data) => {
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
function validateConfiguration() {
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
        };
        console.log('🔍 Validating configuration...');
        const requiredVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'COOKIE_SECRET'];
        const missingVars = requiredVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }
        const validatedConfig = configSchema.parse(rawConfig);
        console.log('✅ Configuration validation successful');
        return validatedConfig;
    }
    catch (error) {
        console.error('❌ Configuration validation failed:');
        if (error instanceof zod_1.z.ZodError) {
            console.error('Validation errors:');
            error.errors.forEach((err, index) => {
                console.error(`  ${index + 1}. ${err.path.join('.')}: ${err.message}`);
            });
        }
        else {
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
exports.config = validateConfiguration();
//# sourceMappingURL=config.js.map