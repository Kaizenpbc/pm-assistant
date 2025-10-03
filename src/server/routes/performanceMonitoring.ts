import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getPerformanceMonitoringService } from '../services/performanceMonitoringService';

interface GetMetricsQuery {
  metricName?: string;
  limit?: string;
  timeRange?: string;
}

interface GetAlertsQuery {
  limit?: string;
  severity?: string;
  acknowledged?: string;
}

interface AcknowledgeAlertParams {
  alertId: string;
}

interface UpdateThresholdParams {
  thresholdId: string;
}

interface UpdateThresholdBody {
  enabled?: boolean;
  threshold?: number | string;
  severity?: 'info' | 'warning' | 'critical';
  description?: string;
  cooldownMinutes?: number;
}

export async function performanceMonitoringRoutes(fastify: FastifyInstance) {
  // Initialize performance monitoring service
  let monitoringService;
  try {
    monitoringService = getPerformanceMonitoringService(fastify);
    
    // Start monitoring if not already running
    if (!monitoringService.isMonitoringActive()) {
      monitoringService.startMonitoring(30000); // 30 seconds interval
    }
  } catch (error) {
    fastify.log.error('Failed to initialize performance monitoring service:', error);
    // Continue without performance monitoring
  }

  // Get performance metrics
  fastify.get<{ Querystring: GetMetricsQuery }>('/performance/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!monitoringService) {
        reply.code(503).send({
          success: false,
          error: 'Performance monitoring service not available'
        });
        return;
      }
      
      const { metricName, limit = '100' } = request.query as GetMetricsQuery;
      const metrics = monitoringService.getMetrics(metricName, parseInt(limit));
      
      reply.code(200).send({
        success: true,
        data: {
          metrics,
          count: metrics.length,
          metricName: metricName || 'all'
        }
      });
    } catch (error) {
      fastify.log.error('Error fetching performance metrics:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch performance metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get performance thresholds
  fastify.get('/performance/thresholds', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const thresholds = monitoringService.getThresholds();
      
      reply.code(200).send({
        success: true,
        data: {
          thresholds,
          count: thresholds.length
        }
      });
    } catch (error) {
      fastify.log.error('Error fetching performance thresholds:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch performance thresholds',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get performance alerts
  fastify.get<{ Querystring: GetAlertsQuery }>('/performance/alerts', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { limit = '50', severity, acknowledged } = request.query as GetAlertsQuery;
      
      const acknowledgedBool = acknowledged ? acknowledged === 'true' : undefined;
      const alerts = monitoringService.getAlerts(parseInt(limit), severity, acknowledgedBool);
      
      reply.code(200).send({
        success: true,
        data: {
          alerts,
          count: alerts.length,
          filters: { severity, acknowledged }
        }
      });
    } catch (error) {
      fastify.log.error('Error fetching performance alerts:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch performance alerts',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get SLA metrics
  fastify.get('/performance/sla', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const slaMetrics = monitoringService.getSLAMetrics();
      
      reply.code(200).send({
        success: true,
        data: {
          slaMetrics,
          count: slaMetrics.length
        }
      });
    } catch (error) {
      fastify.log.error('Error fetching SLA metrics:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch SLA metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get monitoring dashboard data
  fastify.get('/performance/dashboard', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const metrics = monitoringService.getMetrics(undefined, 100);
      const alerts = monitoringService.getAlerts(20);
      const thresholds = monitoringService.getThresholds();
      const slaMetrics = monitoringService.getSLAMetrics();
      const stats = monitoringService.getMonitoringStats();
      
      // Group metrics by name for easier consumption
      const metricsByType: Record<string, any[]> = {};
      metrics.forEach(metric => {
        if (!metricsByType[metric.name]) {
          metricsByType[metric.name] = [];
        }
        metricsByType[metric.name].push(metric);
      });
      
      reply.code(200).send({
        success: true,
        data: {
          metrics: metricsByType,
          alerts,
          thresholds,
          slaMetrics,
          stats,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      fastify.log.error('Error fetching performance dashboard data:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch performance dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Acknowledge alert
  fastify.post<{ Params: AcknowledgeAlertParams }>('/performance/alerts/:alertId/acknowledge', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { alertId } = request.params as AcknowledgeAlertParams;
      const { acknowledgedBy } = request.body as { acknowledgedBy: string };
      
      if (!acknowledgedBy) {
        reply.code(400).send({
          success: false,
          error: 'acknowledgedBy is required'
        });
        return;
      }
      
      const success = await monitoringService.acknowledgeAlert(alertId, acknowledgedBy);
      
      if (!success) {
        reply.code(404).send({
          success: false,
          error: 'Alert not found'
        });
        return;
      }
      
      reply.code(200).send({
        success: true,
        message: 'Alert acknowledged successfully'
      });
    } catch (error) {
      fastify.log.error('Error acknowledging alert:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to acknowledge alert',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Resolve alert
  fastify.post<{ Params: AcknowledgeAlertParams }>('/performance/alerts/:alertId/resolve', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { alertId } = request.params as AcknowledgeAlertParams;
      
      const success = await monitoringService.resolveAlert(alertId);
      
      if (!success) {
        reply.code(404).send({
          success: false,
          error: 'Alert not found'
        });
        return;
      }
      
      reply.code(200).send({
        success: true,
        message: 'Alert resolved successfully'
      });
    } catch (error) {
      fastify.log.error('Error resolving alert:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to resolve alert',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update threshold
  fastify.put<{ Params: UpdateThresholdParams; Body: UpdateThresholdBody }>('/performance/thresholds/:thresholdId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { thresholdId } = request.params as UpdateThresholdParams;
      const updates = request.body as UpdateThresholdBody;
      
      const success = await monitoringService.updateThreshold(thresholdId, updates);
      
      if (!success) {
        reply.code(404).send({
          success: false,
          error: 'Threshold not found'
        });
        return;
      }
      
      reply.code(200).send({
        success: true,
        message: 'Threshold updated successfully'
      });
    } catch (error) {
      fastify.log.error('Error updating threshold:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to update threshold',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get monitoring statistics
  fastify.get('/performance/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = monitoringService.getMonitoringStats();
      
      reply.code(200).send({
        success: true,
        data: stats
      });
    } catch (error) {
      fastify.log.error('Error fetching monitoring statistics:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch monitoring statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Start monitoring
  fastify.post('/performance/monitoring/start', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { interval = 30000 } = request.body as { interval?: number };
      
      monitoringService.startMonitoring(interval);
      
      reply.code(200).send({
        success: true,
        message: 'Performance monitoring started',
        interval
      });
    } catch (error) {
      fastify.log.error('Error starting performance monitoring:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to start performance monitoring',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Stop monitoring
  fastify.post('/performance/monitoring/stop', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      monitoringService.stopMonitoring();
      
      reply.code(200).send({
        success: true,
        message: 'Performance monitoring stopped'
      });
    } catch (error) {
      fastify.log.error('Error stopping performance monitoring:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to stop performance monitoring',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get monitoring status
  fastify.get('/performance/monitoring/status', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const isActive = monitoringService.isMonitoringActive();
      
      reply.code(200).send({
        success: true,
        data: {
          isActive,
          status: isActive ? 'running' : 'stopped',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      fastify.log.error('Error fetching monitoring status:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch monitoring status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
