"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityMiddleware = securityMiddleware;
exports.securityValidationMiddleware = securityValidationMiddleware;
exports.createRateLimitMiddleware = createRateLimitMiddleware;
const config_1 = require("../config");
async function securityMiddleware(request, reply) {
    const isDevelopment = config_1.config.NODE_ENV === 'development';
    const isProduction = config_1.config.NODE_ENV === 'production';
    reply.header('X-Robots-Tag', 'noindex, nofollow');
    reply.header('X-Download-Options', 'noopen');
    reply.header('X-Permitted-Cross-Domain-Policies', 'none');
    if (request.url.includes('/api/auth/') || request.url.includes('/api/users/')) {
        reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        reply.header('Pragma', 'no-cache');
        reply.header('Expires', '0');
        reply.header('Surrogate-Control', 'no-store');
    }
    if (request.url.startsWith('/api/')) {
        reply.header('X-Content-Type-Options', 'nosniff');
        reply.header('X-Frame-Options', 'DENY');
        reply.header('X-XSS-Protection', '1; mode=block');
        reply.header('Access-Control-Allow-Origin', getCorsOrigin(request));
        reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
        reply.header('Access-Control-Allow-Credentials', 'true');
    }
    if (request.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
        reply.header('Cache-Control', 'public, max-age=31536000, immutable');
        reply.header('X-Content-Type-Options', 'nosniff');
    }
    if (request.url === '/api/security/csp-report' && request.method === 'POST') {
        try {
            const body = request.body;
            console.warn('CSP Violation Report:', {
                timestamp: new Date().toISOString(),
                userAgent: request.headers['user-agent'],
                violation: body
            });
            if (isProduction) {
            }
            reply.code(204).send();
            return;
        }
        catch (error) {
            console.error('Error processing CSP report:', error);
            reply.code(400).send({ error: 'Invalid CSP report' });
            return;
        }
    }
}
function getCorsOrigin(request) {
    const origin = request.headers.origin;
    if (!origin) {
        return config_1.config.CORS_ORIGIN || '*';
    }
    if (config_1.config.NODE_ENV === 'development') {
        if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
            return origin;
        }
    }
    if (origin === config_1.config.CORS_ORIGIN) {
        return origin;
    }
    return config_1.config.CORS_ORIGIN || '*';
}
async function securityValidationMiddleware(request, reply) {
    const contentLength = parseInt(request.headers['content-length'] || '0');
    const maxSize = 10 * 1024 * 1024;
    if (contentLength > maxSize) {
        reply.code(413).send({ error: 'Request too large' });
        return;
    }
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const contentType = request.headers['content-type'];
        if (!contentType || !contentType.includes('application/json')) {
            reply.code(400).send({ error: 'Invalid content type' });
            return;
        }
    }
    const requestId = `req-${Math.random().toString(36).substr(2, 9)}`;
    request.headers['x-request-id'] = requestId;
    reply.header('X-Request-ID', requestId);
}
function createRateLimitMiddleware(max, timeWindow) {
    return async (request, reply) => {
        const clientId = request.ip;
        const now = Date.now();
        console.log(`Rate limit check for ${clientId}: ${max} requests per ${timeWindow}`);
    };
}
//# sourceMappingURL=securityMiddleware.js.map