import { FastifyRequest, FastifyReply } from 'fastify';
import { config } from '../config';

/**
 * Security middleware for additional security headers and validation
 */
export async function securityMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const isDevelopment = config.NODE_ENV === 'development';
  const isProduction = config.NODE_ENV === 'production';

  // Add additional security headers
  reply.header('X-Robots-Tag', 'noindex, nofollow');
  reply.header('X-Download-Options', 'noopen');
  reply.header('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Add cache control headers for sensitive endpoints
  if (request.url.includes('/api/auth/') || request.url.includes('/api/users/')) {
    reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');
    reply.header('Surrogate-Control', 'no-store');
  }

  // Add security headers for API responses
  if (request.url.startsWith('/api/')) {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    
    // Add CORS headers for API responses
    reply.header('Access-Control-Allow-Origin', getCorsOrigin(request));
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    reply.header('Access-Control-Allow-Credentials', 'true');
  }

  // Add security headers for static assets
  if (request.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    reply.header('Cache-Control', 'public, max-age=31536000, immutable');
    reply.header('X-Content-Type-Options', 'nosniff');
  }

  // Add CSP reporting endpoint
  if (request.url === '/api/security/csp-report' && request.method === 'POST') {
    // Handle CSP violation reports
    try {
      const body = request.body as any;
      console.warn('CSP Violation Report:', {
        timestamp: new Date().toISOString(),
        userAgent: request.headers['user-agent'],
        violation: body
      });
      
      // In production, you might want to send this to a monitoring service
      if (isProduction) {
        // TODO: Send to monitoring service (e.g., Sentry, DataDog)
      }
      
      reply.code(204).send();
      return;
    } catch (error) {
      console.error('Error processing CSP report:', error);
      reply.code(400).send({ error: 'Invalid CSP report' });
      return;
    }
  }
}

/**
 * Get the appropriate CORS origin based on the request
 */
function getCorsOrigin(request: FastifyRequest): string {
  const origin = request.headers.origin;
  
  if (!origin) {
    return config.CORS_ORIGIN || '*';
  }
  
  // Allow localhost in development
  if (config.NODE_ENV === 'development') {
    if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
      return origin;
    }
  }
  
  // Allow configured origin
  if (origin === config.CORS_ORIGIN) {
    return origin;
  }
  
  return config.CORS_ORIGIN || '*';
}

/**
 * Security validation middleware for sensitive operations
 */
export async function securityValidationMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Validate request size
  const contentLength = parseInt(request.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    reply.code(413).send({ error: 'Request too large' });
    return;
  }
  
  // Validate content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      reply.code(400).send({ error: 'Invalid content type' });
      return;
    }
  }
  
  // Add request ID for tracking
  const requestId = `req-${Math.random().toString(36).substr(2, 9)}`;
  request.headers['x-request-id'] = requestId;
  reply.header('X-Request-ID', requestId);
}

/**
 * Rate limiting middleware for sensitive endpoints
 */
export function createRateLimitMiddleware(max: number, timeWindow: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Simple in-memory rate limiting (in production, use Redis)
    const clientId = request.ip;
    const now = Date.now();
    
    // This is a simplified implementation
    // In production, use a proper rate limiting library with Redis
    console.log(`Rate limit check for ${clientId}: ${max} requests per ${timeWindow}`);
    
    // For now, just log the rate limit check
    // TODO: Implement proper rate limiting with Redis
  };
}
