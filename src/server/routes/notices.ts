import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { databaseService } from '../database/connection';
import { randomUUID } from 'crypto';

const createNoticeSchema = z.object({
  regionId: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.enum(['general', 'project_update', 'public_meeting', 'emergency', 'maintenance']).default('general'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  expiresAt: z.string().datetime().optional(),
});

const updateNoticeSchema = createNoticeSchema.partial().omit({ regionId: true });

export async function noticeRoutes(fastify: FastifyInstance) {
  // Get all published notices for a region (public access)
  fastify.get('/region/:regionId', {
    schema: {
      description: 'Get all published notices for a region',
      tags: ['notices'],
      params: {
        type: 'object',
        properties: {
          regionId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            notices: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  regionId: { type: 'string' },
                  title: { type: 'string' },
                  content: { type: 'string' },
                  category: { type: 'string' },
                  priority: { type: 'string' },
                  publishedAt: { type: 'string' },
                  expiresAt: { type: 'string', nullable: true },
                  createdAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { regionId } = request.params as { regionId: string };
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const notices = await databaseService.query(
        `SELECT 
          id, region_id as regionId, title, content, category, priority,
          published_at as publishedAt, expires_at as expiresAt,
          created_at as createdAt, updated_at as updatedAt
        FROM region_notices
        WHERE region_id = ? 
          AND is_published = TRUE
          AND (expires_at IS NULL OR expires_at > ?)
        ORDER BY 
          CASE priority
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
          END,
          published_at DESC
        LIMIT 100`,
        [regionId, now]
      );

      return { notices };
    } catch (error) {
      fastify.log.error('Get notices error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to fetch notices',
      });
    }
  });

  // Get all notices for a region (admin/region_admin only)
  fastify.get('/region/:regionId/all', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Get all notices for a region (including unpublished)',
      tags: ['notices'],
      security: [{ cookieAuth: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { regionId } = request.params as { regionId: string };
      const user = (request as any).user;

      // Check if user is admin or region_admin for this region
      if (user.role !== 'admin' && (user.role !== 'region_admin' || user.region_id !== regionId)) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'You do not have permission to view all notices',
        });
      }

      const notices = await databaseService.query(
        `SELECT 
          id, region_id as regionId, title, content, category, priority,
          is_published as isPublished, published_at as publishedAt,
          expires_at as expiresAt, created_by as createdBy,
          created_at as createdAt, updated_at as updatedAt
        FROM region_notices
        WHERE region_id = ?
        ORDER BY created_at DESC
        LIMIT 100`,
        [regionId]
      );

      return { notices };
    } catch (error) {
      fastify.log.error('Get all notices error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to fetch notices',
      });
    }
  });

  // Create a new notice (region_admin only)
  fastify.post('/', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Create a new region notice',
      tags: ['notices'],
      security: [{ cookieAuth: [] }],
      body: {
        type: 'object',
        required: ['regionId', 'title', 'content'],
        properties: {
          regionId: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
          category: { type: 'string', enum: ['general', 'project_update', 'public_meeting', 'emergency', 'maintenance'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          expiresAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const body = createNoticeSchema.parse(request.body);

      // Check if user is admin or region_admin for this region
      if (user.role !== 'admin' && (user.role !== 'region_admin' || user.region_id !== body.regionId)) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'You do not have permission to create notices for this region',
        });
      }

      const noticeId = randomUUID();
      const publishedAt = body.category === 'emergency' ? new Date() : null;

      await databaseService.query(
        `INSERT INTO region_notices 
          (id, region_id, title, content, category, priority, is_published, published_at, expires_at, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          noticeId,
          body.regionId,
          body.title,
          body.content,
          body.category,
          body.priority,
          publishedAt ? true : false,
          publishedAt,
          body.expiresAt || null,
          user.id,
        ]
      );

      const [notice] = await databaseService.query(
        `SELECT 
          id, region_id as regionId, title, content, category, priority,
          is_published as isPublished, published_at as publishedAt,
          expires_at as expiresAt, created_by as createdBy,
          created_at as createdAt, updated_at as updatedAt
        FROM region_notices
        WHERE id = ?`,
        [noticeId]
      );

      return reply.status(201).send({ notice });
    } catch (error) {
      fastify.log.error('Create notice error:', error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Validation error',
          message: error.errors,
        });
      }
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to create notice',
      });
    }
  });

  // Update a notice (region_admin only)
  fastify.put('/:noticeId', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Update a region notice',
      tags: ['notices'],
      security: [{ cookieAuth: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { noticeId } = request.params as { noticeId: string };
      const user = (request as any).user;
      const body = updateNoticeSchema.parse(request.body);

      // Get notice to check region
      const [notice] = await databaseService.query(
        'SELECT region_id, created_by FROM region_notices WHERE id = ?',
        [noticeId]
      );

      if (!notice) {
        return reply.status(404).send({
          error: 'Not found',
          message: 'Notice not found',
        });
      }

      // Check permissions
      if (user.role !== 'admin' && (user.role !== 'region_admin' || user.region_id !== notice.region_id)) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'You do not have permission to update this notice',
        });
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (body.title !== undefined) {
        updates.push('title = ?');
        values.push(body.title);
      }
      if (body.content !== undefined) {
        updates.push('content = ?');
        values.push(body.content);
      }
      if (body.category !== undefined) {
        updates.push('category = ?');
        values.push(body.category);
      }
      if (body.priority !== undefined) {
        updates.push('priority = ?');
        values.push(body.priority);
      }
      if (body.expiresAt !== undefined) {
        updates.push('expires_at = ?');
        values.push(body.expiresAt || null);
      }

      if (updates.length === 0) {
        return reply.status(400).send({
          error: 'Bad request',
          message: 'No fields to update',
        });
      }

      values.push(noticeId);

      await databaseService.query(
        `UPDATE region_notices SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      );

      const [updated] = await databaseService.query(
        `SELECT 
          id, region_id as regionId, title, content, category, priority,
          is_published as isPublished, published_at as publishedAt,
          expires_at as expiresAt, created_by as createdBy,
          created_at as createdAt, updated_at as updatedAt
        FROM region_notices
        WHERE id = ?`,
        [noticeId]
      );

      return { notice: updated };
    } catch (error) {
      fastify.log.error('Update notice error:', error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Validation error',
          message: error.errors,
        });
      }
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to update notice',
      });
    }
  });

  // Publish/Unpublish a notice (region_admin only)
  fastify.patch('/:noticeId/publish', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Publish or unpublish a notice',
      tags: ['notices'],
      security: [{ cookieAuth: [] }],
      body: {
        type: 'object',
        required: ['isPublished'],
        properties: {
          isPublished: { type: 'boolean' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { noticeId } = request.params as { noticeId: string };
      const user = (request as any).user;
      const { isPublished } = request.body as { isPublished: boolean };

      // Get notice to check region
      const [notice] = await databaseService.query(
        'SELECT region_id FROM region_notices WHERE id = ?',
        [noticeId]
      );

      if (!notice) {
        return reply.status(404).send({
          error: 'Not found',
          message: 'Notice not found',
        });
      }

      // Check permissions
      if (user.role !== 'admin' && (user.role !== 'region_admin' || user.region_id !== notice.region_id)) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'You do not have permission to publish this notice',
        });
      }

      await databaseService.query(
        `UPDATE region_notices 
        SET is_published = ?, published_at = ${isPublished ? 'NOW()' : 'NULL'}, updated_at = NOW()
        WHERE id = ?`,
        [isPublished, noticeId]
      );

      const [updated] = await databaseService.query(
        `SELECT 
          id, region_id as regionId, title, content, category, priority,
          is_published as isPublished, published_at as publishedAt,
          expires_at as expiresAt, created_by as createdBy,
          created_at as createdAt, updated_at as updatedAt
        FROM region_notices
        WHERE id = ?`,
        [noticeId]
      );

      return { notice: updated };
    } catch (error) {
      fastify.log.error('Publish notice error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to publish notice',
      });
    }
  });

  // Delete a notice (region_admin only)
  fastify.delete('/:noticeId', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Delete a region notice',
      tags: ['notices'],
      security: [{ cookieAuth: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { noticeId } = request.params as { noticeId: string };
      const user = (request as any).user;

      // Get notice to check region
      const [notice] = await databaseService.query(
        'SELECT region_id FROM region_notices WHERE id = ?',
        [noticeId]
      );

      if (!notice) {
        return reply.status(404).send({
          error: 'Not found',
          message: 'Notice not found',
        });
      }

      // Check permissions
      if (user.role !== 'admin' && (user.role !== 'region_admin' || user.region_id !== notice.region_id)) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'You do not have permission to delete this notice',
        });
      }

      await databaseService.query('DELETE FROM region_notices WHERE id = ?', [noticeId]);

      return { success: true, message: 'Notice deleted successfully' };
    } catch (error) {
      fastify.log.error('Delete notice error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to delete notice',
      });
    }
  });
}

