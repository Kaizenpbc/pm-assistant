"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const auth_1 = require("./routes/auth");
const projects_1 = require("./routes/projects");
const users_1 = require("./routes/users");
const schedules_1 = require("./routes/schedules");
const aiScheduling_1 = require("./routes/aiScheduling");
const version_1 = require("./routes/version");
const health_1 = require("./routes/health");
async function registerRoutes(fastify) {
    await fastify.register(auth_1.authRoutes, { prefix: '/api/v1/auth' });
    await fastify.register(projects_1.projectRoutes, { prefix: '/api/v1/projects' });
    await fastify.register(users_1.userRoutes, { prefix: '/api/v1/users' });
    await fastify.register(schedules_1.scheduleRoutes, { prefix: '/api/v1/schedules' });
    await fastify.register(aiScheduling_1.aiSchedulingRoutes, { prefix: '/api/v1/ai-scheduling' });
    await fastify.register(health_1.healthRoutes, { prefix: '/api/v1/health' });
    await fastify.register(version_1.versionRoutes, { prefix: '/api/v1' });
    if (process.env.NODE_ENV === 'production') {
        await fastify.register(require('@fastify/static'), {
            root: require('path').join(__dirname, '../../client/dist'),
            prefix: '/',
        });
    }
}
//# sourceMappingURL=routes.js.map