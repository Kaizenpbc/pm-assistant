"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPlugins = registerPlugins;
const cookie_1 = __importDefault(require("@fastify/cookie"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const auditService_1 = require("./services/auditService");
async function registerPlugins(fastify) {
    fastify.addHook('onRequest', logger_1.requestLogger);
    await fastify.register(helmet_1.default, {
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
    await fastify.register(cors_1.default, {
        origin: config_1.config.CORS_ORIGIN,
        credentials: true,
    });
    await fastify.register(rate_limit_1.default, {
        max: 100,
        timeWindow: '1 minute',
        keyGenerator: (request) => {
            return request.ip;
        },
        errorResponseBuilder: (request, context) => {
            return {
                statusCode: 429,
                error: 'Too Many Requests',
                message: `Rate limit exceeded, retry in ${context.after}ms`,
                retryAfter: Math.round(Number(context.after) / 1000)
            };
        }
    });
    fastify.register(rate_limit_1.default, {
        max: 5,
        timeWindow: '15 minutes',
        keyGenerator: (request) => {
            return request.ip;
        }
    });
    await fastify.register(cookie_1.default, {
        secret: config_1.config.COOKIE_SECRET,
        parseOptions: {
            httpOnly: true,
            secure: config_1.config.NODE_ENV === 'production',
            sameSite: 'strict',
        },
    });
    await fastify.register(swagger_1.default, {
        swagger: {
            info: {
                title: 'PM Application API',
                description: 'Production-ready Project Management API',
                version: '2.0.0',
            },
            host: `${config_1.config.HOST}:${config_1.config.PORT}`,
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
    await fastify.register(swagger_ui_1.default, {
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
    fastify.setErrorHandler(async (error, request, reply) => {
        console.error('Global error handler:', error);
        auditService_1.auditService.logSystemEvent(request, 'error', {
            error: error.message,
            stack: error.stack,
            url: request.url,
            method: request.method
        });
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
    fastify.setNotFoundHandler(async (request, reply) => {
        auditService_1.auditService.logSystemEvent(request, 'not_found', {
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
    fastify.get('/health', async (request, reply) => {
        const health = {
            status: 'OK',
            service: 'PM Application v2',
            version: '2.0.0',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: config_1.config.NODE_ENV
        };
        reply.send(health);
    });
    fastify.get('/api/admin/audit', {
        preHandler: async (request, reply) => {
            auditService_1.auditService.logSystemEvent(request, 'audit_access', {
                url: request.url,
                method: request.method
            });
        }
    }, async (request, reply) => {
        const { userId, action, resource, startDate, endDate, limit } = request.query;
        const events = auditService_1.auditService.getEvents({
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
            stats: auditService_1.auditService.getAuditStats()
        });
    });
}
//# sourceMappingURL=plugins.js.map