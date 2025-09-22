import { FastifyInstance } from 'fastify';
import { authRoutes } from './routes/auth';
import { projectRoutes } from './routes/projects';
import { userRoutes } from './routes/users';

export async function registerRoutes(fastify: FastifyInstance) {
  // API routes
  await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  await fastify.register(projectRoutes, { prefix: '/api/v1/projects' });
  await fastify.register(userRoutes, { prefix: '/api/v1/users' });

  // Serve static files (for production)
  if (process.env.NODE_ENV === 'production') {
    await fastify.register(require('@fastify/static'), {
      root: require('path').join(__dirname, '../../client/dist'),
      prefix: '/',
    });
  }
}
