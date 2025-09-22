import { FastifyRequest } from 'fastify';
export interface PerformanceMetric {
    id: string;
    timestamp: string;
    operation: string;
    duration: number;
    memoryUsage: NodeJS.MemoryUsage;
    requestId?: string;
    userId?: string;
    metadata?: Record<string, any>;
}
export interface PerformanceStats {
    totalOperations: number;
    averageDuration: number;
    slowestOperation: PerformanceMetric | null;
    fastestOperation: PerformanceMetric | null;
    operationsByType: Record<string, number>;
    averageMemoryUsage: number;
    peakMemoryUsage: number;
}
declare class PerformanceService {
    private metrics;
    private maxMetrics;
    private activeTimers;
    private generateMetricId;
    private getContextFromRequest;
    startTimer(operation: string, metadata?: Record<string, any>): string;
    endTimer(timerId: string, req?: FastifyRequest): PerformanceMetric | null;
    measureAsync<T>(operation: string, fn: () => Promise<T>, req?: FastifyRequest, metadata?: Record<string, any>): Promise<T>;
    measureSync<T>(operation: string, fn: () => T, req?: FastifyRequest, metadata?: Record<string, any>): T;
    measureDatabaseOperation<T>(operation: string, query: string, fn: () => Promise<T>, req?: FastifyRequest): Promise<T>;
    measureEndpoint<T>(endpoint: string, method: string, fn: () => Promise<T>, req?: FastifyRequest): Promise<T>;
    getStats(): PerformanceStats;
    getMetrics(filters?: {
        operation?: string;
        startDate?: string;
        endDate?: string;
        minDuration?: number;
        maxDuration?: number;
        limit?: number;
    }): PerformanceMetric[];
    getSlowOperations(thresholdMs?: number): PerformanceMetric[];
    getMetricsByUser(userId: string): PerformanceMetric[];
    clearOldMetrics(olderThanDays?: number): void;
    exportMetrics(): PerformanceMetric[];
    getActiveTimers(): Array<{
        id: string;
        operation: string;
        duration: number;
        metadata?: Record<string, any>;
    }>;
}
export declare const performanceService: PerformanceService;
export default performanceService;
//# sourceMappingURL=performanceService.d.ts.map