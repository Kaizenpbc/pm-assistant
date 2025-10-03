import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { performance } from 'perf_hooks';
import os from 'os';
import fs from 'fs';
import path from 'path';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
}

interface PerformanceThreshold {
  id: string;
  metricName: string;
  operator: '>' | '<' | '>=' | '<=' | '=' | '!=' | 'contains';
  threshold: number | string;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  description?: string;
  cooldownMinutes?: number;
}

interface PerformanceAlert {
  id: string;
  thresholdId: string;
  metricName: string;
  currentValue: number | string;
  thresholdValue: number | string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedAt?: string;
}

interface SLAMetric {
  name: string;
  target: number;
  current: number;
  unit: string;
  status: 'pass' | 'fail' | 'warning';
  lastUpdated: string;
}

class PerformanceMonitoringService {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private thresholds: PerformanceThreshold[] = [];
  private alerts: PerformanceAlert[] = [];
  private slaMetrics: SLAMetric[] = [];
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertCooldowns: Map<string, Date> = new Map();

  constructor(private fastify: FastifyInstance) {
    this.initializeDefaultThresholds();
    this.initializeSLAMetrics();
  }

  private initializeDefaultThresholds() {
    this.thresholds = [
      {
        id: 'cpu-usage-high',
        metricName: 'cpu.usage',
        operator: '>',
        threshold: 80,
        severity: 'warning',
        enabled: true,
        description: 'CPU usage above 80%',
        cooldownMinutes: 5
      },
      {
        id: 'cpu-usage-critical',
        metricName: 'cpu.usage',
        operator: '>',
        threshold: 95,
        severity: 'critical',
        enabled: true,
        description: 'CPU usage above 95%',
        cooldownMinutes: 2
      },
      {
        id: 'memory-usage-high',
        metricName: 'memory.usage',
        operator: '>',
        threshold: 85,
        severity: 'warning',
        enabled: true,
        description: 'Memory usage above 85%',
        cooldownMinutes: 5
      },
      {
        id: 'memory-usage-critical',
        metricName: 'memory.usage',
        operator: '>',
        threshold: 95,
        severity: 'critical',
        enabled: true,
        description: 'Memory usage above 95%',
        cooldownMinutes: 2
      },
      {
        id: 'response-time-slow',
        metricName: 'api.response_time',
        operator: '>',
        threshold: 2000,
        severity: 'warning',
        enabled: true,
        description: 'API response time above 2 seconds',
        cooldownMinutes: 3
      },
      {
        id: 'response-time-critical',
        metricName: 'api.response_time',
        operator: '>',
        threshold: 5000,
        severity: 'critical',
        enabled: true,
        description: 'API response time above 5 seconds',
        cooldownMinutes: 1
      },
      {
        id: 'database-response-slow',
        metricName: 'database.response_time',
        operator: '>',
        threshold: 1000,
        severity: 'warning',
        enabled: true,
        description: 'Database response time above 1 second',
        cooldownMinutes: 3
      },
      {
        id: 'database-response-critical',
        metricName: 'database.response_time',
        operator: '>',
        threshold: 3000,
        severity: 'critical',
        enabled: true,
        description: 'Database response time above 3 seconds',
        cooldownMinutes: 1
      }
    ];
  }

  private initializeSLAMetrics() {
    this.slaMetrics = [
      {
        name: 'API Uptime',
        target: 99.9,
        current: 99.9,
        unit: '%',
        status: 'pass',
        lastUpdated: new Date().toISOString()
      },
      {
        name: 'API Response Time',
        target: 500,
        current: 245,
        unit: 'ms',
        status: 'pass',
        lastUpdated: new Date().toISOString()
      },
      {
        name: 'Database Uptime',
        target: 99.95,
        current: 99.95,
        unit: '%',
        status: 'pass',
        lastUpdated: new Date().toISOString()
      },
      {
        name: 'Database Response Time',
        target: 100,
        current: 85,
        unit: 'ms',
        status: 'pass',
        lastUpdated: new Date().toISOString()
      },
      {
        name: 'Error Rate',
        target: 0.1,
        current: 0.05,
        unit: '%',
        status: 'pass',
        lastUpdated: new Date().toISOString()
      }
    ];
  }

  startMonitoring(intervalMs = 30000) {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.fastify.log.info('Starting performance monitoring...');

    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
      await this.checkThresholds();
      await this.updateSLAMetrics();
    }, intervalMs);

    // Initial collection
    this.collectMetrics();
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    this.fastify.log.info('Performance monitoring stopped');
  }

  private async collectMetrics() {
    const timestamp = new Date().toISOString();
    
    try {
      // System metrics
      const cpuUsage = await this.getCPUUsage();
      const memoryUsage = await this.getMemoryUsage();
      const diskUsage = await this.getDiskUsage();
      
      // Database metrics
      const dbResponseTime = await this.getDatabaseResponseTime();
      
      // API metrics
      const apiResponseTime = await this.getAPIResponseTime();

      // Store metrics
      this.storeMetric('cpu.usage', cpuUsage, '%', timestamp);
      this.storeMetric('memory.usage', memoryUsage, '%', timestamp);
      this.storeMetric('disk.usage', diskUsage, '%', timestamp);
      this.storeMetric('database.response_time', dbResponseTime, 'ms', timestamp);
      this.storeMetric('api.response_time', apiResponseTime, 'ms', timestamp);

      // Clean up old metrics (keep last 24 hours)
      this.cleanupOldMetrics();

    } catch (error) {
      this.fastify.log.error('Error collecting performance metrics:', error);
    }
  }

  private async getCPUUsage(): Promise<number> {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += (cpu.times as any)[type];
      }
      totalIdle += cpu.times.idle;
    }

    return Math.round(100 - (100 * totalIdle / totalTick));
  }

  private async getMemoryUsage(): Promise<number> {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    return Math.round((usedMemory / totalMemory) * 100);
  }

  private async getDiskUsage(): Promise<number> {
    try {
      const stats = fs.statSync('.');
      // This is a simplified version - in production, you'd use a proper disk usage library
      return 45; // Placeholder - would need proper disk usage calculation
    } catch (error) {
      return 0;
    }
  }

  private async getDatabaseResponseTime(): Promise<number> {
    try {
      const start = performance.now();
      // Simulate database query
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      const end = performance.now();
      return Math.round(end - start);
    } catch (error) {
      return 0;
    }
  }

  private async getAPIResponseTime(): Promise<number> {
    try {
      const start = performance.now();
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
      const end = performance.now();
      return Math.round(end - start);
    } catch (error) {
      return 0;
    }
  }

  private storeMetric(name: string, value: number, unit: string, timestamp: string) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metric: PerformanceMetric = {
      id: `${name}-${Date.now()}`,
      name,
      value,
      unit,
      timestamp,
      tags: { source: 'system' }
    };

    this.metrics.get(name)!.push(metric);
  }

  private cleanupOldMetrics() {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    for (const [metricName, metrics] of this.metrics) {
      const filteredMetrics = metrics.filter(metric => metric.timestamp > cutoffTime);
      this.metrics.set(metricName, filteredMetrics);
    }
  }

  private async checkThresholds() {
    for (const threshold of this.thresholds) {
      if (!threshold.enabled) continue;

      const metrics = this.metrics.get(threshold.metricName);
      if (!metrics || metrics.length === 0) continue;

      const latestMetric = metrics[metrics.length - 1];
      const shouldAlert = this.evaluateThreshold(latestMetric.value, threshold);

      if (shouldAlert) {
        const cooldownKey = `${threshold.id}-${latestMetric.value}`;
        const lastAlert = this.alertCooldowns.get(cooldownKey);
        const cooldownMs = (threshold.cooldownMinutes || 5) * 60 * 1000;

        if (!lastAlert || (Date.now() - lastAlert.getTime()) > cooldownMs) {
          await this.createAlert(threshold, latestMetric);
          this.alertCooldowns.set(cooldownKey, new Date());
        }
      }
    }
  }

  private evaluateThreshold(value: number, threshold: PerformanceThreshold): boolean {
    switch (threshold.operator) {
      case '>':
        return value > (threshold.threshold as number);
      case '<':
        return value < (threshold.threshold as number);
      case '>=':
        return value >= (threshold.threshold as number);
      case '<=':
        return value <= (threshold.threshold as number);
      case '=':
        return value === (threshold.threshold as number);
      case '!=':
        return value !== (threshold.threshold as number);
      default:
        return false;
    }
  }

  private async createAlert(threshold: PerformanceThreshold, metric: PerformanceMetric) {
    const alert: PerformanceAlert = {
      id: `alert-${Date.now()}`,
      thresholdId: threshold.id,
      metricName: metric.name,
      currentValue: metric.value,
      thresholdValue: threshold.threshold,
      severity: threshold.severity,
      message: `${threshold.description || metric.name} threshold exceeded: ${metric.value} ${metric.unit} (threshold: ${threshold.threshold})`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false
    };

    this.alerts.unshift(alert); // Add to beginning of array
    
    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(0, 1000);
    }

    // Send notification
    await this.sendAlertNotification(alert);

    this.fastify.log.warn(`Performance alert: ${alert.message}`);
  }

  private async sendAlertNotification(alert: PerformanceAlert) {
    // This would integrate with your notification service
    // For now, we'll just log it
    this.fastify.log.warn(`ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
    
    // In a real implementation, this would:
    // 1. Send email notifications
    // 2. Send SMS alerts
    // 3. Post to webhooks (Slack, Discord, etc.)
    // 4. Create incidents in monitoring tools
  }

  private async updateSLAMetrics() {
    // Update SLA metrics based on current performance
    const now = new Date().toISOString();
    
    // API Uptime SLA
    const apiUptime = this.calculateUptime('api.response_time');
    this.updateSLAMetric('API Uptime', apiUptime, '%', apiUptime >= 99.9 ? 'pass' : 'fail', now);
    
    // API Response Time SLA
    const avgResponseTime = this.getAverageMetric('api.response_time', 5);
    this.updateSLAMetric('API Response Time', avgResponseTime, 'ms', avgResponseTime <= 500 ? 'pass' : 'warning', now);
    
    // Database Uptime SLA
    const dbUptime = this.calculateUptime('database.response_time');
    this.updateSLAMetric('Database Uptime', dbUptime, '%', dbUptime >= 99.95 ? 'pass' : 'fail', now);
    
    // Database Response Time SLA
    const avgDbResponseTime = this.getAverageMetric('database.response_time', 5);
    this.updateSLAMetric('Database Response Time', avgDbResponseTime, 'ms', avgDbResponseTime <= 100 ? 'pass' : 'warning', now);
    
    // Error Rate SLA
    const errorRate = this.calculateErrorRate();
    this.updateSLAMetric('Error Rate', errorRate, '%', errorRate <= 0.1 ? 'pass' : 'warning', now);
  }

  private updateSLAMetric(name: string, current: number, unit: string, status: 'pass' | 'fail' | 'warning', lastUpdated: string) {
    const existingIndex = this.slaMetrics.findIndex(sla => sla.name === name);
    if (existingIndex >= 0) {
      this.slaMetrics[existingIndex] = { name, target: this.slaMetrics[existingIndex].target, current, unit, status, lastUpdated };
    }
  }

  private calculateUptime(metricName: string): number {
    const metrics = this.metrics.get(metricName);
    if (!metrics || metrics.length === 0) return 100;
    
    const recentMetrics = metrics.slice(-100); // Last 100 measurements
    const failures = recentMetrics.filter(m => m.value === 0).length;
    return Math.round(((recentMetrics.length - failures) / recentMetrics.length) * 100);
  }

  private getAverageMetric(metricName: string, count: number): number {
    const metrics = this.metrics.get(metricName);
    if (!metrics || metrics.length === 0) return 0;
    
    const recentMetrics = metrics.slice(-count);
    const sum = recentMetrics.reduce((acc, metric) => acc + metric.value, 0);
    return Math.round(sum / recentMetrics.length);
  }

  private calculateErrorRate(): number {
    // This would calculate actual error rate from logs/metrics
    // For now, return a simulated value
    return 0.05;
  }

  // Public API methods
  getMetrics(metricName?: string, limit = 100): PerformanceMetric[] {
    if (metricName) {
      return this.metrics.get(metricName)?.slice(-limit) || [];
    }
    
    const allMetrics: PerformanceMetric[] = [];
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics.slice(-limit));
    }
    return allMetrics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getThresholds(): PerformanceThreshold[] {
    return [...this.thresholds];
  }

  getAlerts(limit = 50, severity?: string, acknowledged?: boolean): PerformanceAlert[] {
    let alerts = [...this.alerts];
    
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }
    
    if (acknowledged !== undefined) {
      alerts = alerts.filter(alert => alert.acknowledged === acknowledged);
    }
    
    return alerts.slice(0, limit);
  }

  getSLAMetrics(): SLAMetric[] {
    return [...this.slaMetrics];
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;
    
    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date().toISOString();
    
    return true;
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;
    
    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();
    
    return true;
  }

  async updateThreshold(thresholdId: string, updates: Partial<PerformanceThreshold>): Promise<boolean> {
    const thresholdIndex = this.thresholds.findIndex(t => t.id === thresholdId);
    if (thresholdIndex === -1) return false;
    
    this.thresholds[thresholdIndex] = { ...this.thresholds[thresholdIndex], ...updates };
    return true;
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  getMonitoringStats() {
    const totalAlerts = this.alerts.length;
    const activeAlerts = this.alerts.filter(a => !a.resolved).length;
    const criticalAlerts = this.alerts.filter(a => a.severity === 'critical' && !a.resolved).length;
    
    return {
      isMonitoring: this.isMonitoring,
      totalMetrics: Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.length, 0),
      totalAlerts,
      activeAlerts,
      criticalAlerts,
      thresholdsCount: this.thresholds.length,
      slaMetricsCount: this.slaMetrics.length
    };
  }
}

export { PerformanceMonitoringService, PerformanceMetric, PerformanceThreshold, PerformanceAlert, SLAMetric };
