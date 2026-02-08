import { FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config';
import { requestLogger } from './utils/logger';
import { auditService } from './services/auditService';
import { securityMiddleware, securityValidationMiddleware } from './middleware/securityMiddleware';

export async function registerPlugins(fastify: FastifyInstance) {
  // Request logging middleware
  fastify.addHook('onRequest', requestLogger);
  
  // Security middleware
  fastify.addHook('onRequest', securityMiddleware);
  fastify.addHook('preHandler', securityValidationMiddleware);

  // Security
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'", 
          "'unsafe-inline'", 
          "https://fonts.googleapis.com"
        ],
        scriptSrc: [
          "'self'",
          ...(config.NODE_ENV === 'development' ? ["'unsafe-eval'", "'unsafe-inline'"] : [])
        ],
        imgSrc: [
          "'self'", 
          "data:", 
          "blob:",
          "https:"
        ],
        connectSrc: [
          "'self'",
          ...(config.NODE_ENV === 'development' ? [
            "http://localhost:3000",
            "ws://localhost:3000",
            "wss://localhost:3000"
          ] : [])
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com"
        ],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: config.NODE_ENV === 'production' ? [] : null,
      },
      reportOnly: config.NODE_ENV === 'development'
    },
    hsts: config.NODE_ENV === 'production' ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    } : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginEmbedderPolicy: false, // Disable for development
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    xssFilter: true
  });

  // CORS
  await fastify.register(cors, {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow localhost on any port for development
      if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
        return callback(null, true);
      }
      
      // Allow the configured origin
      if (origin === config.CORS_ORIGIN) {
        return callback(null, true);
      }
      
      // For development, allow all origins
      if (config.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'x-user-role', 'x-user-id'],
  });

  // Rate limiting temporarily disabled for development
  // await fastify.register(rateLimit, {
  //   max: 100,
  //   timeWindow: '1 minute',
  //   keyGenerator: (request) => {
  //     return request.ip;
  //   },
  //   errorResponseBuilder: (request, context) => {
  //     return {
  //       statusCode: 429,
  //       error: 'Too Many Requests',
  //       message: `Rate limit exceeded, retry in ${context.after}ms`,
  //       retryAfter: Math.round(Number(context.after) / 1000)
  //     };
  //   }
  // });

  // Additional rate limiting for auth endpoints temporarily disabled
  // fastify.register(rateLimit, {
  //   max: 5,
  //   timeWindow: '15 minutes',
  //   keyGenerator: (request) => {
  //     return request.ip;
  //   }
  // });

  // Cookies
  await fastify.register(cookie, {
    secret: config.COOKIE_SECRET,
    parseOptions: {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  });

  // Swagger documentation
  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'PM Application API',
        description: 'Production-ready Project Management API',
        version: '2.0.0',
      },
      host: `${config.HOST}:${config.PORT}`,
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });

  // Global error handler
  fastify.setErrorHandler(async (err: unknown, request, reply) => {
    const error = err instanceof Error ? err : new Error(String(err));
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
    // Log error
    console.error('Global error handler:', error);

    // Audit log the error
    auditService.logSystemEvent(request, 'error', {
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method
    });

    // Send appropriate response
    const message = statusCode === 500 ? 'Internal Server Error' : error.message;

    reply.status(statusCode).send({
      statusCode,
      error: statusCode === 500 ? 'Internal Server Error' : error.name || 'Error',
      message,
      timestamp: new Date().toISOString(),
      path: request.url
    });
  });

  // 404 handler
  fastify.setNotFoundHandler(async (request, reply) => {
    auditService.logSystemEvent(request, 'not_found', {
      url: request.url,
      method: request.method
    });

    reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
      timestamp: new Date().toISOString()
    });
  });

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    const health = {
      status: 'OK',
      service: 'PM Application v2',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: config.NODE_ENV
    };

    reply.send(health);
  });

  // Audit trail endpoint (admin only)
  fastify.get('/api/admin/audit', {
    preHandler: async (request, reply) => {
      // TODO: Add admin authentication check
      // For now, just log the access attempt
      auditService.logSystemEvent(request, 'audit_access', {
        url: request.url,
        method: request.method
      });
    }
  }, async (request, reply) => {
    const { userId, action, resource, startDate, endDate, limit } = request.query as any;
    
    const events = auditService.getEvents({
      userId,
      action,
      resource,
      startDate,
      endDate,
      limit: limit ? parseInt(limit) : undefined
    });

    reply.send({
      events,
      total: events.length,
      stats: auditService.getAuditStats()
    });
  });
}
