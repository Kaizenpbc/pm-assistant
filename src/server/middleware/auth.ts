import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.cookies.access_token;
    
    if (!token) {
      return reply.status(401).send({
        error: 'No access token',
        message: 'Access token is required',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    
    // Add user info to request
    (request as any).user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };

  } catch (error) {
    return reply.status(401).send({
      error: 'Invalid token',
      message: 'Access token is invalid or expired',
    });
  }
}
