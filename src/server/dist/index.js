"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fastify_1 = __importDefault(require("fastify"));
const config_1 = require("./config");
const plugins_1 = require("./plugins");
const routes_1 = require("./routes");
const connection_1 = require("./database/connection");
const fastify = (0, fastify_1.default)({
    logger: {
        level: config_1.config.NODE_ENV === 'production' ? 'info' : 'debug'
    }
});
async function start() {
    try {
        console.log('🔄 Initializing PM Application v2...');
        console.log('🔌 Testing database connection...');
        const isConnected = await connection_1.databaseService.testConnection();
        if (!isConnected) {
            throw new Error('Database connection failed');
        }
        console.log('✅ Database connection successful');
        console.log('⚠️ Skipping database migrations - using manual setup');
        console.log('⚠️ Skipping database seeding - using manual setup');
        console.log('🔌 Registering plugins...');
        await (0, plugins_1.registerPlugins)(fastify);
        console.log('✅ Plugins registered');
        console.log('🛣️ Registering routes...');
        await (0, routes_1.registerRoutes)(fastify);
        console.log('✅ Routes registered');
        console.log('🚀 Starting server...');
        await fastify.listen({
            port: config_1.config.PORT,
            host: config_1.config.HOST
        });
        console.log(`🎉 PM Application v2 running on http://${config_1.config.HOST}:${config_1.config.PORT}`);
        console.log(`📚 API Documentation: http://${config_1.config.HOST}:${config_1.config.PORT}/documentation`);
        console.log(`🔍 Health Check: http://${config_1.config.HOST}:${config_1.config.PORT}/health`);
        console.log(`📊 Monitoring: http://${config_1.config.HOST}:${config_1.config.PORT}/monitoring`);
    }
    catch (err) {
        console.error('❌ Failed to start server:', err);
        fastify.log.error(err);
        process.exit(1);
    }
}
process.on('SIGINT', async () => {
    console.log('🛑 Shutting down server...');
    await fastify.close();
    await connection_1.databaseService.close();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down server...');
    await fastify.close();
    await connection_1.databaseService.close();
    process.exit(0);
});
start();
//# sourceMappingURL=index.js.map