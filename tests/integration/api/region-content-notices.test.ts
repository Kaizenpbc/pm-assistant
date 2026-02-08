import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../server/test-utils';

const TEST_REGION_ID = '11111111-1111-1111-1111-111111111111';

describe('Region content & notices API (public)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/region-content/region/:regionId', () => {
    it('returns 200 and sections array', async () => {
      const res = await request(app.server)
        .get(`/api/v1/region-content/region/${TEST_REGION_ID}`)
        .expect(200);
      expect(res.body).toHaveProperty('sections');
      expect(Array.isArray(res.body.sections)).toBe(true);
    });
  });

  describe('GET /api/v1/region-content/region/:regionId/section/:sectionType', () => {
    it('returns 404 when section does not exist', async () => {
      await request(app.server)
        .get(`/api/v1/region-content/region/${TEST_REGION_ID}/section/about`)
        .expect(404);
    });
  });

  describe('GET /api/v1/notices/region/:regionId', () => {
    it('returns 200 and notices array', async () => {
      const res = await request(app.server)
        .get(`/api/v1/notices/region/${TEST_REGION_ID}`)
        .expect(200);
      expect(res.body).toHaveProperty('notices');
      expect(Array.isArray(res.body.notices)).toBe(true);
    });
  });
});
