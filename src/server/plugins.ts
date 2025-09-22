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

export async function registerPlugins(fastify: FastifyInstance) {
  // Request logging middleware
  fastify.addHook('onRequest', requestLogger);

  // Security
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  });

  // CORS
  await fastify.register(cors, {
    origin: config.CORS_ORIGIN,
    credentials: true,
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
  fastify.setErrorHandler(async (error, request, reply) => {
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
    const statusCode = error.statusCode || 500;
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
