import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../server/test-utils';

describe('System Connectivity Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Endpoints', () => {
    it('should respond to basic health check', async () => {
      const response = await request(app.server)
        .get('/health/basic')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body.status).toBe('OK');
    });

    it('should respond to detailed health check', async () => {
      const response = await request(app.server)
        .get('/health/detailed')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('checks');
      
      // Check services structure
      expect(response.body.services).toHaveProperty('database');
      expect(response.body.services).toHaveProperty('memory');
      expect(response.body.services).toHaveProperty('cpu');
      
      // Check that we have health checks
      expect(Array.isArray(response.body.checks)).toBe(true);
      expect(response.body.checks.length).toBeGreaterThan(0);
    });

    it('should respond to readiness probe', async () => {
      const response = await request(app.server)
        .get('/health/ready')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('message');
    });

    it('should respond to liveness probe', async () => {
      const response = await request(app.server)
        .get('/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('message');
      expect(response.body.status).toBe('live');
    });
  });

  describe('Database Connectivity', () => {
    it('should have database connection in detailed health', async () => {
      const response = await request(app.server)
        .get('/health/detailed')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });

      const dbCheck = response.body.checks.find((check: any) => 
        check.name === 'database_connection'
      );
      
      expect(dbCheck).toBeDefined();
      expect(dbCheck).toHaveProperty('name', 'database_connection');
      expect(dbCheck).toHaveProperty('status');
      expect(dbCheck).toHaveProperty('details');
      expect(dbCheck).toHaveProperty('responseTime');
    });

    it('should test database connection response time', async () => {
      const response = await request(app.server)
        .get('/health/detailed')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });

      const dbCheck = response.body.checks.find((check: any) => 
        check.name === 'database_connection'
      );
      
      expect(dbCheck.responseTime).toBeGreaterThanOrEqual(0);
      expect(dbCheck.responseTime).toBeLessThan(5000); // Should be under 5 seconds
    });
  });

  describe('API Endpoints Accessibility', () => {
    it('should have API accessibility check in detailed health', async () => {
      const response = await request(app.server)
        .get('/health/detailed')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });

      const apiCheck = response.body.checks.find((check: any) => 
        check.name === 'api_accessibility'
      );
      
      expect(apiCheck).toBeDefined();
      expect(apiCheck).toHaveProperty('name', 'api_accessibility');
      expect(apiCheck).toHaveProperty('status');
      expect(apiCheck).toHaveProperty('details');
    });

    it('should have environment variables check', async () => {
      const response = await request(app.server)
        .get('/health/detailed')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });

      const envCheck = response.body.checks.find((check: any) => 
        check.name === 'environment_variables'
      );
      
      expect(envCheck).toBeDefined();
      expect(envCheck).toHaveProperty('name', 'environment_variables');
      expect(envCheck).toHaveProperty('status');
      expect(envCheck).toHaveProperty('details');
    });
  });

  describe('System Resource Monitoring', () => {
    it('should include memory usage information', async () => {
      const response = await request(app.server)
        .get('/health/detailed')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });

      expect(response.body.services.memory).toHaveProperty('used');
      expect(response.body.services.memory).toHaveProperty('total');
      expect(response.body.services.memory).toHaveProperty('percentage');
      
      expect(typeof response.body.services.memory.used).toBe('number');
      expect(typeof response.body.services.memory.total).toBe('number');
      expect(typeof response.body.services.memory.percentage).toBe('number');
      expect(response.body.services.memory.percentage).toBeGreaterThanOrEqual(0);
      expect(response.body.services.memory.percentage).toBeLessThanOrEqual(100);
    });

    it('should include CPU load information', async () => {
      const response = await request(app.server)
        .get('/health/detailed')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });

      expect(response.body.services.cpu).toHaveProperty('load');
      expect(typeof response.body.services.cpu.load).toBe('number');
      expect(response.body.services.cpu.load).toBeGreaterThanOrEqual(0);
    });

    it('should have memory usage health check', async () => {
      const response = await request(app.server)
        .get('/health/detailed')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });

      const memoryCheck = response.body.checks.find((check: any) => 
        check.name === 'memory_usage'
      );
      
      expect(memoryCheck).toBeDefined();
      expect(memoryCheck).toHaveProperty('name', 'memory_usage');
      expect(memoryCheck).toHaveProperty('status');
      expect(memoryCheck).toHaveProperty('details');
    });

    it('should have CPU usage health check', async () => {
      const response = await request(app.server)
        .get('/health/detailed')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });

      const cpuCheck = response.body.checks.find((check: any) => 
        check.name === 'cpu_usage'
      );
      
      expect(cpuCheck).toBeDefined();
      expect(cpuCheck).toHaveProperty('name', 'cpu_usage');
      expect(cpuCheck).toHaveProperty('status');
      expect(cpuCheck).toHaveProperty('details');
    });
  });

  describe('Response Time Performance', () => {
    it('should respond to basic health check within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app.server)
        .get('/health/basic')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should respond to detailed health check within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app.server)
        .get('/health/detailed')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });

    it('should have response time in basic health data', async () => {
      const response = await request(app.server)
        .get('/health/basic')
        .expect(200);

      expect(response.body).toHaveProperty('responseTime');
      expect(typeof response.body.responseTime).toBe('string');
      expect(response.body.responseTime).toMatch(/\d+\.\d+ms/);
    });

    it('should have response time in detailed health data', async () => {
      const response = await request(app.server)
        .get('/health/detailed')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });

      expect(response.body).toHaveProperty('responseTime');
      expect(typeof response.body.responseTime).toBe('string');
      expect(response.body.responseTime).toMatch(/\d+\.\d+ms/);
    });
  });

  describe('Error Handling', () => {
    it('should handle health check errors gracefully', async () => {
      // Test that health endpoints don't crash the server
      const response = await request(app.server)
        .get('/health/detailed')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });

      // Even if some checks fail, the endpoint should still respond
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return proper error format for invalid endpoints', async () => {
      await request(app.server)
        .get('/health/invalid')
        .expect(404);
    });
  });

  describe('Concurrent Health Checks', () => {
    it('should handle multiple concurrent health check requests', async () => {
      const promises = Array(5).fill(null).map(() => 
        request(app.server).get('/health/basic').expect(200)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('OK');
        expect(response.body).toHaveProperty('timestamp');
      });
    });

    it('should handle concurrent detailed health checks', async () => {
      const promises = Array(3).fill(null).map(() => 
        request(app.server).get('/health/detailed').expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        })
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('checks');
        expect(Array.isArray(response.body.checks)).toBe(true);
      });
    });
  });
});
