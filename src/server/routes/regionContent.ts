import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { databaseService } from '../database/connection';
import { randomUUID } from 'crypto';

const createSectionSchema = z.object({
  regionId: z.string().uuid(),
  sectionType: z.enum(['about', 'contact', 'services', 'statistics', 'location', 'demographics', 'history', 'leadership', 'custom']),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  displayOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
  metadata: z.record(z.string(), z.any()).optional(),
});

const updateSectionSchema = createSectionSchema.partial().omit({ regionId: true, sectionType: true });

export async function regionContentRoutes(fastify: FastifyInstance) {
  // Get all content sections for a region (public access)
  fastify.get('/region/:regionId', {
    schema: {
      description: 'Get all visible content sections for a region',
      tags: ['region-content'],
      params: {
        type: 'object',
        properties: {
          regionId: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { regionId } = request.params as { regionId: string };

      const sections = await databaseService.query(
        `SELECT 
          id, region_id as regionId, section_type as sectionType, title, content,
          display_order as displayOrder, is_visible as isVisible, metadata,
          created_at as createdAt, updated_at as updatedAt
        FROM region_content_sections
        WHERE region_id = ? AND is_visible = TRUE
        ORDER BY display_order ASC, created_at ASC`,
        [regionId]
      );

      return { sections };
    } catch (error) {
      fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Get region content error');
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to fetch region content',
      });
    }
  });

  // Get all content sections for a region (admin/region_admin only - includes hidden)
  fastify.get('/region/:regionId/all', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Get all content sections for a region (including hidden)',
      tags: ['region-content'],
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
          message: 'You do not have permission to view all sections',
        });
      }

      const sections = await databaseService.query(
        `SELECT 
          id, region_id as regionId, section_type as sectionType, title, content,
          display_order as displayOrder, is_visible as isVisible, metadata,
          created_by as createdBy, created_at as createdAt, updated_at as updatedAt
        FROM region_content_sections
        WHERE region_id = ?
        ORDER BY display_order ASC, created_at ASC`,
        [regionId]
      );

      return { sections };
    } catch (error) {
      fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Get all region content error');
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to fetch region content',
      });
    }
  });

  // Get a specific section by type
  fastify.get('/region/:regionId/section/:sectionType', {
    schema: {
      description: 'Get a specific content section by type',
      tags: ['region-content'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { regionId, sectionType } = request.params as { regionId: string; sectionType: string };

      const [section] = await databaseService.query(
        `SELECT 
          id, region_id as regionId, section_type as sectionType, title, content,
          display_order as displayOrder, is_visible as isVisible, metadata,
          created_at as createdAt, updated_at as updatedAt
        FROM region_content_sections
        WHERE region_id = ? AND section_type = ? AND is_visible = TRUE
        LIMIT 1`,
        [regionId, sectionType]
      );

      if (!section) {
        return reply.status(404).send({
          error: 'Not found',
          message: 'Section not found',
        });
      }

      return { section };
    } catch (error) {
      fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Get section error');
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to fetch section',
      });
    }
  });

  // Create or update a content section (region_admin only)
  fastify.post('/', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Create or update a region content section',
      tags: ['region-content'],
      security: [{ cookieAuth: [] }],
      body: {
        type: 'object',
        required: ['regionId', 'sectionType', 'title', 'content'],
        properties: {
          regionId: { type: 'string' },
          sectionType: { type: 'string', enum: ['about', 'contact', 'services', 'statistics', 'location', 'demographics', 'history', 'leadership', 'custom'] },
          title: { type: 'string' },
          content: { type: 'string' },
          displayOrder: { type: 'number' },
          isVisible: { type: 'boolean' },
          metadata: { type: 'object' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const body = createSectionSchema.parse(request.body);

      // Check if user is admin or region_admin for this region
      if (user.role !== 'admin' && (user.role !== 'region_admin' || user.region_id !== body.regionId)) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'You do not have permission to create sections for this region',
        });
      }

      // Check if section already exists (upsert)
      const [existing] = await databaseService.query(
        'SELECT id FROM region_content_sections WHERE region_id = ? AND section_type = ?',
        [body.regionId, body.sectionType]
      );

      let section;
      if (existing) {
        // Update existing section
        await databaseService.query(
          `UPDATE region_content_sections 
          SET title = ?, content = ?, display_order = ?, is_visible = ?, metadata = ?, updated_at = NOW()
          WHERE id = ?`,
          [
            body.title,
            body.content,
            body.displayOrder,
            body.isVisible,
            body.metadata ? JSON.stringify(body.metadata) : null,
            existing.id,
          ]
        );

        [section] = await databaseService.query(
          `SELECT 
            id, region_id as regionId, section_type as sectionType, title, content,
            display_order as displayOrder, is_visible as isVisible, metadata,
            created_by as createdBy, created_at as createdAt, updated_at as updatedAt
          FROM region_content_sections
          WHERE id = ?`,
          [existing.id]
        );
      } else {
        // Create new section
        const sectionId = randomUUID();
        await databaseService.query(
          `INSERT INTO region_content_sections 
            (id, region_id, section_type, title, content, display_order, is_visible, metadata, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            sectionId,
            body.regionId,
            body.sectionType,
            body.title,
            body.content,
            body.displayOrder,
            body.isVisible,
            body.metadata ? JSON.stringify(body.metadata) : null,
            user.id,
          ]
        );

        [section] = await databaseService.query(
          `SELECT 
            id, region_id as regionId, section_type as sectionType, title, content,
            display_order as displayOrder, is_visible as isVisible, metadata,
            created_by as createdBy, created_at as createdAt, updated_at as updatedAt
          FROM region_content_sections
          WHERE id = ?`,
          [sectionId]
        );
      }

      return reply.status(existing ? 200 : 201).send({ section });
    } catch (error) {
      fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Create/update section error');
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Validation error',
          message: error.issues,
        });
      }
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to create/update section',
      });
    }
  });

  // Update a section (region_admin only)
  fastify.put('/:sectionId', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Update a region content section',
      tags: ['region-content'],
      security: [{ cookieAuth: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { sectionId } = request.params as { sectionId: string };
      const user = (request as any).user;
      const body = updateSectionSchema.parse(request.body);

      // Get section to check region
      const [section] = await databaseService.query(
        'SELECT region_id FROM region_content_sections WHERE id = ?',
        [sectionId]
      );

      if (!section) {
        return reply.status(404).send({
          error: 'Not found',
          message: 'Section not found',
        });
      }

      // Check permissions
      if (user.role !== 'admin' && (user.role !== 'region_admin' || user.region_id !== section.region_id)) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'You do not have permission to update this section',
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
      if (body.displayOrder !== undefined) {
        updates.push('display_order = ?');
        values.push(body.displayOrder);
      }
      if (body.isVisible !== undefined) {
        updates.push('is_visible = ?');
        values.push(body.isVisible);
      }
      if (body.metadata !== undefined) {
        updates.push('metadata = ?');
        values.push(body.metadata ? JSON.stringify(body.metadata) : null);
      }

      if (updates.length === 0) {
        return reply.status(400).send({
          error: 'Bad request',
          message: 'No fields to update',
        });
      }

      values.push(sectionId);

      await databaseService.query(
        `UPDATE region_content_sections SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      );

      const [updated] = await databaseService.query(
        `SELECT 
          id, region_id as regionId, section_type as sectionType, title, content,
          display_order as displayOrder, is_visible as isVisible, metadata,
          created_by as createdBy, created_at as createdAt, updated_at as updatedAt
        FROM region_content_sections
        WHERE id = ?`,
        [sectionId]
      );

      return { section: updated };
    } catch (error) {
      fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Update section error');
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Validation error',
          message: error.issues,
        });
      }
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to update section',
      });
    }
  });

  // Delete a section (region_admin only)
  fastify.delete('/:sectionId', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Delete a region content section',
      tags: ['region-content'],
      security: [{ cookieAuth: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { sectionId } = request.params as { sectionId: string };
      const user = (request as any).user;

      // Get section to check region
      const [section] = await databaseService.query(
        'SELECT region_id FROM region_content_sections WHERE id = ?',
        [sectionId]
      );

      if (!section) {
        return reply.status(404).send({
          error: 'Not found',
          message: 'Section not found',
        });
      }

      // Check permissions
      if (user.role !== 'admin' && (user.role !== 'region_admin' || user.region_id !== section.region_id)) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'You do not have permission to delete this section',
        });
      }

      await databaseService.query('DELETE FROM region_content_sections WHERE id = ?', [sectionId]);

      return { success: true, message: 'Section deleted successfully' };
    } catch (error) {
      fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Delete section error');
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to delete section',
      });
    }
  });
}

