"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPlugins = registerPlugins;
const cookie_1 = __importDefault(require("@fastify/cookie"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const auditService_1 = require("./services/auditService");
const securityMiddleware_1 = require("./middleware/securityMiddleware");
async function registerPlugins(fastify) {
    fastify.addHook('onRequest', logger_1.requestLogger);
    fastify.addHook('onRequest', securityMiddleware_1.securityMiddleware);
    fastify.addHook('preHandler', securityMiddleware_1.securityValidationMiddleware);
    await fastify.register(helmet_1.default, {
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
                    ...(config_1.config.NODE_ENV === 'development' ? ["'unsafe-eval'", "'unsafe-inline'"] : [])
                ],
                imgSrc: [
                    "'self'",
                    "data:",
                    "blob:",
                    "https:"
                ],
                connectSrc: [
                    "'self'",
                    ...(config_1.config.NODE_ENV === 'development' ? [
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
                upgradeInsecureRequests: config_1.config.NODE_ENV === 'production' ? [] : null,
            },
            reportOnly: config_1.config.NODE_ENV === 'development'
        },
        hsts: config_1.config.NODE_ENV === 'production' ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        } : false,
        noSniff: true,
        xssFilter: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        crossOriginEmbedderPolicy: false,
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
    await fastify.register(cors_1.default, {
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
                return callback(null, true);
            }
            if (origin === config_1.config.CORS_ORIGIN) {
                return callback(null, true);
            }
            if (config_1.config.NODE_ENV === 'development') {
                return callback(null, true);
            }
            callback(new Error('Not allowed by CORS'), false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    });
    await fastify.register(cookie_1.default, {
        secret: config_1.config.COOKIE_SECRET,
        parseOptions: {
            httpOnly: true,
            secure: config_1.config.NODE_ENV === 'production',
            sameSite: 'lax',
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