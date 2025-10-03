import { FastifyInstance } from 'fastify';
import { authRoutes } from './routes/auth';
import { projectRoutes } from './routes/projects';
import { userRoutes } from './routes/users';
import { scheduleRoutes } from './routes/schedules';
import { aiSchedulingRoutes } from './routes/aiScheduling';
import { versionRoutes } from './routes/version';
import { healthRoutes } from './routes/health';
import { systemHealthRoutes } from './routes/systemHealth';
import { performanceMonitoringRoutes } from './routes/performanceMonitoring';

export async function registerRoutes(fastify: FastifyInstance) {
  // API routes
  await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  await fastify.register(projectRoutes, { prefix: '/api/v1/projects' });
  await fastify.register(userRoutes, { prefix: '/api/v1/users' });
  await fastify.register(scheduleRoutes, { prefix: '/api/v1/schedules' });
  await fastify.register(aiSchedulingRoutes, { prefix: '/api/v1/ai-scheduling' });
  await fastify.register(healthRoutes, { prefix: '/api/v1/health' });
  await fastify.register(versionRoutes, { prefix: '/api/v1' });
  await fastify.register(performanceMonitoringRoutes, { prefix: '/api/v1' });
  
  // System health routes (no prefix for direct access)
  await fastify.register(systemHealthRoutes);

  // Serve static files (for production)
  if (process.env.NODE_ENV === 'production') {
    await fastify.register(require('@fastify/static'), {
      root: require('path').join(__dirname, '../../client/dist'),
      prefix: '/',
    });
  }
}
