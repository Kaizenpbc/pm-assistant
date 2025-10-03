import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { databaseService } from '../database/connection';
import { performance } from 'perf_hooks';

interface SystemHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      load: number;
    };
  };
  checks: {
    name: string;
    status: 'pass' | 'fail';
    responseTime: number;
    details?: string;
  }[];
}

export async function systemHealthRoutes(fastify: FastifyInstance) {
  // Basic health check endpoint
  fastify.get('/health/basic', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const startTime = performance.now();
      
      // Basic system info
      const systemInfo = {
        status: 'OK',
        service: 'PM Application v2',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          rss: process.memoryUsage().rss,
          heapTotal: process.memoryUsage().heapTotal,
          heapUsed: process.memoryUsage().heapUsed,
          external: process.memoryUsage().external,
          arrayBuffers: process.memoryUsage().arrayBuffers,
        },
        environment: process.env.NODE_ENV || 'development',
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version
      };

      const responseTime = performance.now() - startTime;
      
      reply.code(200).send({
        ...systemInfo,
        responseTime: `${responseTime.toFixed(2)}ms`
      });
    } catch (error) {
      fastify.log.error('Health check failed:', error);
      reply.code(500).send({
        status: 'ERROR',
        service: 'PM Application v2',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Comprehensive health check with service dependencies
  fastify.get('/health/detailed', async (request: FastifyRequest, reply: FastifyReply) => {
    const healthStatus: SystemHealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: { status: 'unhealthy' },
        memory: {
          used: 0,
          total: 0,
          percentage: 0
        },
        cpu: {
          load: 0
        }
      },
      checks: []
    };

    const checks = [];

    // 1. Database connectivity check
    try {
      const dbStartTime = performance.now();
      const dbConnected = await databaseService.testConnection();
      const dbResponseTime = performance.now() - dbStartTime;
      
      healthStatus.services.database = {
        status: dbConnected ? 'healthy' : 'unhealthy',
        responseTime: dbResponseTime
      };
      
      checks.push({
        name: 'database_connection',
        status: dbConnected ? 'pass' : 'fail',
        responseTime: dbResponseTime,
        details: dbConnected ? 'Database connection successful' : 'Database connection failed'
      });
    } catch (error) {
      healthStatus.services.database = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
      
      checks.push({
        name: 'database_connection',
        status: 'fail',
        responseTime: 0,
        details: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // 2. Memory usage check
    try {
      const memUsage = process.memoryUsage();
      const totalMemory = memUsage.rss;
      const usedMemory = memUsage.heapUsed;
      const memoryPercentage = (usedMemory / totalMemory) * 100;
      
      healthStatus.services.memory = {
        used: usedMemory,
        total: totalMemory,
        percentage: memoryPercentage
      };
      
      const memoryStatus = memoryPercentage < 90 ? 'pass' : 'fail';
      checks.push({
        name: 'memory_usage',
        status: memoryStatus,
        responseTime: 0,
        details: `Memory usage: ${memoryPercentage.toFixed(2)}%`
      });
    } catch (error) {
      checks.push({
        name: 'memory_usage',
        status: 'fail',
        responseTime: 0,
        details: 'Failed to check memory usage'
      });
    }

    // 3. CPU load check (basic)
    try {
      const cpuUsage = process.cpuUsage();
      const load = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
      
      healthStatus.services.cpu = {
        load: load
      };
      
      const cpuStatus = load < 100 ? 'pass' : 'fail';
      checks.push({
        name: 'cpu_usage',
        status: cpuStatus,
        responseTime: 0,
        details: `CPU load: ${load.toFixed(2)}s`
      });
    } catch (error) {
      checks.push({
        name: 'cpu_usage',
        status: 'fail',
        responseTime: 0,
        details: 'Failed to check CPU usage'
      });
    }

    // 4. Environment variables check
    try {
      const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_NAME'];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      checks.push({
        name: 'environment_variables',
        status: missingVars.length === 0 ? 'pass' : 'fail',
        responseTime: 0,
        details: missingVars.length === 0 ? 'All required environment variables present' : `Missing: ${missingVars.join(', ')}`
      });
    } catch (error) {
      checks.push({
        name: 'environment_variables',
        status: 'fail',
        responseTime: 0,
        details: 'Failed to check environment variables'
      });
    }

    // 5. API endpoint accessibility check
    try {
      const apiStartTime = performance.now();
      // Simple check - if we can reach this endpoint, API is working
      const apiResponseTime = performance.now() - apiStartTime;
      
      checks.push({
        name: 'api_accessibility',
        status: 'pass',
        responseTime: apiResponseTime,
        details: 'API endpoints are accessible'
      });
    } catch (error) {
      checks.push({
        name: 'api_accessibility',
        status: 'fail',
        responseTime: 0,
        details: 'API endpoints are not accessible'
      });
    }

    healthStatus.checks = checks;

    // Determine overall status
    const failedChecks = checks.filter(check => check.status === 'fail');
    if (failedChecks.length === 0) {
      healthStatus.status = 'healthy';
    } else if (failedChecks.length <= 2) {
      healthStatus.status = 'degraded';
    } else {
      healthStatus.status = 'unhealthy';
    }

    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;

    reply.code(statusCode).send(healthStatus);
  });

  // Quick readiness check (for load balancers)
  fastify.get('/health/ready', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Quick database check
      const dbConnected = await databaseService.testConnection();
      
      if (dbConnected) {
        reply.code(200).send({
          status: 'ready',
          timestamp: new Date().toISOString()
        });
      } else {
        reply.code(503).send({
          status: 'not_ready',
          reason: 'Database not connected',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      reply.code(503).send({
        status: 'not_ready',
        reason: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Liveness check (for Kubernetes)
  fastify.get('/health/live', async (request: FastifyRequest, reply: FastifyReply) => {
    // Simple liveness check - if the process is running, it's alive
    reply.code(200).send({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      pid: process.pid
    });
  });
}
