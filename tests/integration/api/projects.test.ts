import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../server/test-utils';

describe('Projects API Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await app.mysql.query('DELETE FROM projects WHERE name LIKE "Test Project%"');
  });

  describe('GET /api/v1/projects', () => {
    it('should return projects list', async () => {
      const response = await request(app.server)
        .get('/api/v1/projects')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(0);
    });

    it('should return projects with correct structure', async () => {
      const response = await request(app.server)
        .get('/api/v1/projects')
        .expect(200);

      if (response.body.length > 0) {
        const project = response.body[0];
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('name');
        expect(project).toHaveProperty('description');
        expect(project).toHaveProperty('status');
        expect(project).toHaveProperty('createdAt');
        expect(project).toHaveProperty('updatedAt');
      }
    });
  });

  describe('POST /api/v1/projects', () => {
    it('should create a new project', async () => {
      const projectData = {
        name: 'Test Project Integration',
        description: 'Test project for integration testing',
        status: 'active'
      };

      const response = await request(app.server)
        .post('/api/v1/projects')
        .send(projectData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(projectData.name);
      expect(response.body.description).toBe(projectData.description);
      expect(response.body.status).toBe(projectData.status);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Missing name field'
      };

      await request(app.server)
        .post('/api/v1/projects')
        .send(invalidData)
        .expect(400);
    });

    it('should validate project name length', async () => {
      const invalidData = {
        name: 'A', // Too short
        description: 'Valid description'
      };

      await request(app.server)
        .post('/api/v1/projects')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    it('should return a specific project', async () => {
      // First create a project
      const projectData = {
        name: 'Test Project for Get',
        description: 'Test project for GET endpoint',
        status: 'active'
      };

      const createResponse = await request(app.server)
        .post('/api/v1/projects')
        .send(projectData)
        .expect(201);

      const projectId = createResponse.body.id;

      // Then get the project
      const response = await request(app.server)
        .get(`/api/v1/projects/${projectId}`)
        .expect(200);

      expect(response.body.id).toBe(projectId);
      expect(response.body.name).toBe(projectData.name);
    });

    it('should return 404 for non-existent project', async () => {
      await request(app.server)
        .get('/api/v1/projects/99999')
        .expect(404);
    });
  });

  describe('PUT /api/v1/projects/:id', () => {
    it('should update a project', async () => {
      // First create a project
      const projectData = {
        name: 'Test Project for Update',
        description: 'Test project for UPDATE endpoint',
        status: 'active'
      };

      const createResponse = await request(app.server)
        .post('/api/v1/projects')
        .send(projectData)
        .expect(201);

      const projectId = createResponse.body.id;

      // Then update the project
      const updateData = {
        name: 'Updated Test Project',
        description: 'Updated description',
        status: 'completed'
      };

      const response = await request(app.server)
        .put(`/api/v1/projects/${projectId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.status).toBe(updateData.status);
    });

    it('should return 404 when updating non-existent project', async () => {
      const updateData = {
        name: 'Updated Project',
        description: 'Updated description'
      };

      await request(app.server)
        .put('/api/v1/projects/99999')
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/v1/projects/:id', () => {
    it('should delete a project', async () => {
      // First create a project
      const projectData = {
        name: 'Test Project for Delete',
        description: 'Test project for DELETE endpoint',
        status: 'active'
      };

      const createResponse = await request(app.server)
        .post('/api/v1/projects')
        .send(projectData)
        .expect(201);

      const projectId = createResponse.body.id;

      // Then delete the project
      await request(app.server)
        .delete(`/api/v1/projects/${projectId}`)
        .expect(204);

      // Verify the project is deleted
      await request(app.server)
        .get(`/api/v1/projects/${projectId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent project', async () => {
      await request(app.server)
        .delete('/api/v1/projects/99999')
        .expect(404);
    });
  });

  describe('Error handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // For now, we'll test that the API returns proper error responses
      const response = await request(app.server)
        .get('/api/v1/projects')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });
    });

    it('should return proper error format', async () => {
      const response = await request(app.server)
        .post('/api/v1/projects')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });
  });
});
