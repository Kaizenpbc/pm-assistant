import { FastifyInstance } from 'fastify';
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
declare class PerformanceMonitoringService {
    private fastify;
    private metrics;
    private thresholds;
    private alerts;
    private slaMetrics;
    private isMonitoring;
    private monitoringInterval;
    private alertCooldowns;
    constructor(fastify: FastifyInstance);
    private initializeDefaultThresholds;
    private initializeSLAMetrics;
    startMonitoring(intervalMs?: number): void;
    stopMonitoring(): void;
    private collectMetrics;
    private getCPUUsage;
    private getMemoryUsage;
    private getDiskUsage;
    private getDatabaseResponseTime;
    private getAPIResponseTime;
    private storeMetric;
    private cleanupOldMetrics;
    private checkThresholds;
    private evaluateThreshold;
    private createAlert;
    private sendAlertNotification;
    private updateSLAMetrics;
    private updateSLAMetric;
    private calculateUptime;
    private getAverageMetric;
    private calculateErrorRate;
    getMetrics(metricName?: string, limit?: number): PerformanceMetric[];
    getThresholds(): PerformanceThreshold[];
    getAlerts(limit?: number, severity?: string, acknowledged?: boolean): PerformanceAlert[];
    getSLAMetrics(): SLAMetric[];
    acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<boolean>;
    resolveAlert(alertId: string): Promise<boolean>;
    updateThreshold(thresholdId: string, updates: Partial<PerformanceThreshold>): Promise<boolean>;
    isMonitoringActive(): boolean;
    getMonitoringStats(): {
        isMonitoring: boolean;
        totalMetrics: number;
        totalAlerts: number;
        activeAlerts: number;
        criticalAlerts: number;
        thresholdsCount: number;
        slaMetricsCount: number;
    };
}
export { PerformanceMonitoringService, PerformanceMetric, PerformanceThreshold, PerformanceAlert, SLAMetric };
//# sourceMappingURL=performanceMonitoring.d.ts.map