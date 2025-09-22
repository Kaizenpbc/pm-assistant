import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../middleware/auth';

export async function userRoutes(fastify: FastifyInstance) {
  // Get current user profile
  fastify.get('/me', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Get current user profile',
      tags: ['users'],
      security: [{ cookieAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                fullName: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      return {
        user: {
          id: user.userId,
          username: user.username,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to fetch user profile',
      });
    }
  });
}
