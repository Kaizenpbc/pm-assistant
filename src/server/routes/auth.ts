import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserService } from '../services/UserService';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

export async function authRoutes(fastify: FastifyInstance) {
  const userService = new UserService();

  // Login
  fastify.post('/login', {
    schema: {
      description: 'User login with HttpOnly cookies',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', minLength: 3 },
          password: { type: 'string', minLength: 6 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
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
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { username, password } = loginSchema.parse(request.body);
      
      // Find user
      const user = await userService.findByUsername(username);
      if (!user) {
        return reply.status(401).send({
          error: 'Invalid credentials',
          message: 'Username or password is incorrect',
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return reply.status(401).send({
          error: 'Invalid credentials',
          message: 'Username or password is incorrect',
        });
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        },
        config.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        config.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      // Set HttpOnly cookies
      reply.setCookie('access_token', accessToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      reply.setCookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return {
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      };

    } catch (error) {
      console.error('Login error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Login failed',
      });
    }
  });

  // Register
  fastify.post('/register', {
    schema: {
      description: 'User registration',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['username', 'email', 'password', 'fullName'],
        properties: {
          username: { type: 'string', minLength: 3 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          fullName: { type: 'string', minLength: 2 },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            message: { type: 'string' },
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
      const { username, email, password, fullName } = registerSchema.parse(request.body);
      
      // Check if user exists
      const existingUser = await userService.findByUsername(username);
      if (existingUser) {
        return reply.status(409).send({
          error: 'User already exists',
          message: 'Username is already taken',
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = await userService.create({
        username,
        email,
        passwordHash,
        fullName,
        role: 'user',
      });

      return reply.status(201).send({
        message: 'User created successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });

    } catch (error) {
      console.error('Registration error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Registration failed',
      });
    }
  });

  // Logout
  fastify.post('/logout', {
    schema: {
      description: 'User logout - clears cookies',
      tags: ['auth'],
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Clear cookies
    reply.clearCookie('access_token');
    reply.clearCookie('refresh_token');

    return {
      message: 'Logout successful',
    };
  });

  // Refresh token
  fastify.post('/refresh', {
    schema: {
      description: 'Refresh access token using refresh token',
      tags: ['auth'],
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const refreshToken = request.cookies.refresh_token;
      
      if (!refreshToken) {
        return reply.status(401).send({
          error: 'No refresh token',
          message: 'Refresh token is required',
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as any;
      
      if (decoded.type !== 'refresh') {
        return reply.status(401).send({
          error: 'Invalid token type',
          message: 'Token is not a refresh token',
        });
      }

      // Get user
      const user = await userService.findById(decoded.userId);
      if (!user) {
        return reply.status(401).send({
          error: 'User not found',
          message: 'User associated with token not found',
        });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        },
        config.JWT_SECRET,
        { expiresIn: '15m' }
      );

      // Set new access token cookie
      reply.setCookie('access_token', accessToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      return {
        message: 'Token refreshed successfully',
      };

    } catch (error) {
      console.error('Token refresh error:', error);
      return reply.status(401).send({
        error: 'Invalid refresh token',
        message: 'Refresh token is invalid or expired',
      });
    }
  });
}
