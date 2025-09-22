"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const auth_1 = require("./routes/auth");
const projects_1 = require("./routes/projects");
const users_1 = require("./routes/users");
async function registerRoutes(fastify) {
    fastify.get('/health', {
        schema: {
            description: 'Health check endpoint',
            tags: ['system'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        service: { type: 'string' },
                        version: { type: 'string' },
                        timestamp: { type: 'string' },
                        environment: { type: 'string' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        return {
            status: 'OK',
            service: 'PM Application v2',
            version: '2.0.0',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
        };
    });
    await fastify.register(auth_1.authRoutes, { prefix: '/api/v1/auth' });
    await fastify.register(projects_1.projectRoutes, { prefix: '/api/v1/projects' });
    await fastify.register(users_1.userRoutes, { prefix: '/api/v1/users' });
    if (process.env.NODE_ENV === 'production') {
        await fastify.register(require('@fastify/static'), {
            root: require('path').join(__dirname, '../../client/dist'),
            prefix: '/',
        });
    }
}
//# sourceMappingURL=routes.js.map