import 'dotenv/config';
import Fastify from 'fastify';
import { config } from './config';
import { registerPlugins } from './plugins';
import { registerRoutes } from './routes';
import { databaseService } from './database/connection';
import { migrationService } from './database/migrations';

const fastify = Fastify({
  logger: {
    level: config.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});

async function start() {
  try {
    console.log('🔄 Initializing PM Application v2...');
    
    // Configuration validation is already done in config.ts import
    // This ensures the server won't start with invalid configuration
    
    // Test database connection
    console.log('🔌 Testing database connection...');
    const isConnected = await databaseService.testConnection();
    if (!isConnected) {
      console.log('⚠️ Database connection failed - running in offline mode');
      console.log('💡 To enable full functionality, start MySQL server');
    } else {
      console.log('✅ Database connection successful');
    }
    
      // Skip migrations for now - tables created manually
      console.log('⚠️ Skipping database migrations - using manual setup');
      
      // Skip seeding for now
      console.log('⚠️ Skipping database seeding - using manual setup');
    
    // Register plugins
    console.log('🔌 Registering plugins...');
    await registerPlugins(fastify);
    console.log('✅ Plugins registered');
    
    // Register routes
    console.log('🛣️ Registering routes...');
    await registerRoutes(fastify);
    console.log('✅ Routes registered');
    
    // Start server
    console.log('🚀 Starting server...');
    await fastify.listen({ 
      port: config.PORT, 
      host: config.HOST 
    });
    
    console.log(`🎉 PM Application v2 running on http://${config.HOST}:${config.PORT}`);
    console.log(`📚 API Documentation: http://${config.HOST}:${config.PORT}/documentation`);
    console.log(`🔍 Health Check: http://${config.HOST}:${config.PORT}/health`);
    console.log(`📊 Monitoring: http://${config.HOST}:${config.PORT}/monitoring`);
    
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  await fastify.close();
  await databaseService.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down server...');
  await fastify.close();
  await databaseService.close();
  process.exit(0);
});

start();
