"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMonitoringRoutes = performanceMonitoringRoutes;
const performanceMonitoringService_1 = require("../services/performanceMonitoringService");
async function performanceMonitoringRoutes(fastify) {
    let monitoringService;
    try {
        monitoringService = (0, performanceMonitoringService_1.getPerformanceMonitoringService)(fastify);
        if (!monitoringService.isMonitoringActive()) {
            monitoringService.startMonitoring(30000);
        }
    }
    catch (error) {
        fastify.log.error('Failed to initialize performance monitoring service:', error);
    }
    fastify.get('/performance/metrics', async (request, reply) => {
        try {
            if (!monitoringService) {
                reply.code(503).send({
                    success: false,
                    error: 'Performance monitoring service not available'
                });
                return;
            }
            const { metricName, limit = '100' } = request.query;
            const metrics = monitoringService.getMetrics(metricName, parseInt(limit));
            reply.code(200).send({
                success: true,
                data: {
                    metrics,
                    count: metrics.length,
                    metricName: metricName || 'all'
                }
            });
        }
        catch (error) {
            fastify.log.error('Error fetching performance metrics:', error);
            reply.code(500).send({
                success: false,
                error: 'Failed to fetch performance metrics',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    fastify.get('/performance/thresholds', async (request, reply) => {
        try {
            const thresholds = monitoringService.getThresholds();
            reply.code(200).send({
                success: true,
                data: {
                    thresholds,
                    count: thresholds.length
                }
            });
        }
        catch (error) {
            fastify.log.error('Error fetching performance thresholds:', error);
            reply.code(500).send({
                success: false,
                error: 'Failed to fetch performance thresholds',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    fastify.get('/performance/alerts', async (request, reply) => {
        try {
            const { limit = '50', severity, acknowledged } = request.query;
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
        }
        catch (error) {
            fastify.log.error('Error fetching performance alerts:', error);
            reply.code(500).send({
                success: false,
                error: 'Failed to fetch performance alerts',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    fastify.get('/performance/sla', async (request, reply) => {
        try {
            const slaMetrics = monitoringService.getSLAMetrics();
            reply.code(200).send({
                success: true,
                data: {
                    slaMetrics,
                    count: slaMetrics.length
                }
            });
        }
        catch (error) {
            fastify.log.error('Error fetching SLA metrics:', error);
            reply.code(500).send({
                success: false,
                error: 'Failed to fetch SLA metrics',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    fastify.get('/performance/dashboard', async (request, reply) => {
        try {
            const metrics = monitoringService.getMetrics(undefined, 100);
            const alerts = monitoringService.getAlerts(20);
            const thresholds = monitoringService.getThresholds();
            const slaMetrics = monitoringService.getSLAMetrics();
            const stats = monitoringService.getMonitoringStats();
            const metricsByType = {};
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
        }
        catch (error) {
            fastify.log.error('Error fetching performance dashboard data:', error);
            reply.code(500).send({
                success: false,
                error: 'Failed to fetch performance dashboard data',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    fastify.post('/performance/alerts/:alertId/acknowledge', async (request, reply) => {
        try {
            const { alertId } = request.params;
            const { acknowledgedBy } = request.body;
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
        }
        catch (error) {
            fastify.log.error('Error acknowledging alert:', error);
            reply.code(500).send({
                success: false,
                error: 'Failed to acknowledge alert',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    fastify.post('/performance/alerts/:alertId/resolve', async (request, reply) => {
        try {
            const { alertId } = request.params;
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
        }
        catch (error) {
            fastify.log.error('Error resolving alert:', error);
            reply.code(500).send({
                success: false,
                error: 'Failed to resolve alert',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    fastify.put('/performance/thresholds/:thresholdId', async (request, reply) => {
        try {
            const { thresholdId } = request.params;
            const updates = request.body;
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
        }
        catch (error) {
            fastify.log.error('Error updating threshold:', error);
            reply.code(500).send({
                success: false,
                error: 'Failed to update threshold',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    fastify.get('/performance/stats', async (request, reply) => {
        try {
            const stats = monitoringService.getMonitoringStats();
            reply.code(200).send({
                success: true,
                data: stats
            });
        }
        catch (error) {
            fastify.log.error('Error fetching monitoring statistics:', error);
            reply.code(500).send({
                success: false,
                error: 'Failed to fetch monitoring statistics',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    fastify.post('/performance/monitoring/start', async (request, reply) => {
        try {
            const { interval = 30000 } = request.body;
            monitoringService.startMonitoring(interval);
            reply.code(200).send({
                success: true,
                message: 'Performance monitoring started',
                interval
            });
        }
        catch (error) {
            fastify.log.error('Error starting performance monitoring:', error);
            reply.code(500).send({
                success: false,
                error: 'Failed to start performance monitoring',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    fastify.post('/performance/monitoring/stop', async (request, reply) => {
        try {
            monitoringService.stopMonitoring();
            reply.code(200).send({
                success: true,
                message: 'Performance monitoring stopped'
            });
        }
        catch (error) {
            fastify.log.error('Error stopping performance monitoring:', error);
            reply.code(500).send({
                success: false,
                error: 'Failed to stop performance monitoring',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    fastify.get('/performance/monitoring/status', async (request, reply) => {
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
        }
        catch (error) {
            fastify.log.error('Error fetching monitoring status:', error);
            reply.code(500).send({
                success: false,
                error: 'Failed to fetch monitoring status',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
}
//# sourceMappingURL=performanceMonitoring.js.map