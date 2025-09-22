import { FastifyRequest, FastifyReply } from 'fastify';
import { performanceLogger } from '../utils/logger';

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

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 10000; // Keep last 10k metrics in memory
  private activeTimers: Map<string, { startTime: number; operation: string; metadata?: Record<string, any> }> = new Map();

  private generateMetricId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getContextFromRequest(req: FastifyRequest): { requestId?: string; userId?: string } {
    return {
      requestId: (req as any).requestId,
      userId: (req as any).user?.id
    };
  }

  public startTimer(operation: string, metadata: Record<string, any> = {}): string {
    const timerId = this.generateMetricId();
    this.activeTimers.set(timerId, {
      startTime: performance.now(),
      operation,
      metadata
    });
    return timerId;
  }

  public endTimer(timerId: string, req?: FastifyRequest): PerformanceMetric | null {
    const timer = this.activeTimers.get(timerId);
    if (!timer) {
      console.warn(`Timer ${timerId} not found`);
      return null;
    }

    const duration = performance.now() - timer.startTime;
    const memoryUsage = process.memoryUsage();
    
    const context = req ? this.getContextFromRequest(req) : {};
    
    const metric: PerformanceMetric = {
      id: timerId,
      timestamp: new Date().toISOString(),
      operation: timer.operation,
      duration,
      memoryUsage,
      requestId: context.requestId,
      userId: context.userId,
      metadata: timer.metadata
    };

    // Add to metrics store
    this.metrics.push(metric);
    
    // Trim if too many metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log to Winston
    performanceLogger.info('Performance timer completed', {
      operation: timer.operation,
      duration: Date.now() - timer.startTime,
      metadata: timer.metadata
    });

    // Remove from active timers
    this.activeTimers.delete(timerId);

    return metric;
  }

  public measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    req?: FastifyRequest,
    metadata: Record<string, any> = {}
  ): Promise<T> {
    const timerId = this.startTimer(operation, metadata);
    
    return fn().then(
      (result) => {
        this.endTimer(timerId, req);
        return result;
      },
      (error) => {
        this.endTimer(timerId, req);
        throw error;
      }
    );
  }

  public measureSync<T>(
    operation: string,
    fn: () => T,
    req?: FastifyRequest,
    metadata: Record<string, any> = {}
  ): T {
    const timerId = this.startTimer(operation, metadata);
    
    try {
      const result = fn();
      this.endTimer(timerId, req);
      return result;
    } catch (error) {
      this.endTimer(timerId, req);
      throw error;
    }
  }

  // Database operation monitoring
  public measureDatabaseOperation<T>(
    operation: string,
    query: string,
    fn: () => Promise<T>,
    req?: FastifyRequest
  ): Promise<T> {
    return this.measureAsync(
      `db_${operation}`,
      fn,
      req,
      { query, operation }
    );
  }

  // API endpoint monitoring
  public measureEndpoint<T>(
    endpoint: string,
    method: string,
    fn: () => Promise<T>,
    req?: FastifyRequest
  ): Promise<T> {
    return this.measureAsync(
      `api_${method.toLowerCase()}_${endpoint}`,
      fn,
      req,
      { endpoint, method }
    );
  }

  // Get performance statistics
  public getStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        slowestOperation: null,
        fastestOperation: null,
        operationsByType: {},
        averageMemoryUsage: 0,
        peakMemoryUsage: 0
      };
    }

    const durations = this.metrics.map(m => m.duration);
    const memoryUsages = this.metrics.map(m => m.memoryUsage.heapUsed);
    
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = totalDuration / durations.length;
    
    const slowestOperation = this.metrics.reduce((slowest, current) => 
      current.duration > slowest.duration ? current : slowest
    );
    
    const fastestOperation = this.metrics.reduce((fastest, current) => 
      current.duration < fastest.duration ? current : fastest
    );

    const operationsByType: Record<string, number> = {};
    this.metrics.forEach(metric => {
      operationsByType[metric.operation] = (operationsByType[metric.operation] || 0) + 1;
    });

    const totalMemoryUsage = memoryUsages.reduce((sum, m) => sum + m, 0);
    const averageMemoryUsage = totalMemoryUsage / memoryUsages.length;
    const peakMemoryUsage = Math.max(...memoryUsages);

    return {
      totalOperations: this.metrics.length,
      averageDuration,
      slowestOperation,
      fastestOperation,
      operationsByType,
      averageMemoryUsage,
      peakMemoryUsage
    };
  }

  // Get metrics with filters
  public getMetrics(filters: {
    operation?: string;
    startDate?: string;
    endDate?: string;
    minDuration?: number;
    maxDuration?: number;
    limit?: number;
  } = {}): PerformanceMetric[] {
    let filteredMetrics = [...this.metrics];

    if (filters.operation) {
      filteredMetrics = filteredMetrics.filter(m => m.operation === filters.operation);
    }

    if (filters.startDate) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp >= filters.startDate!);
    }

    if (filters.endDate) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp <= filters.endDate!);
    }

    if (filters.minDuration !== undefined) {
      filteredMetrics = filteredMetrics.filter(m => m.duration >= filters.minDuration!);
    }

    if (filters.maxDuration !== undefined) {
      filteredMetrics = filteredMetrics.filter(m => m.duration <= filters.maxDuration!);
    }

    // Sort by timestamp (newest first)
    filteredMetrics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (filters.limit) {
      filteredMetrics = filteredMetrics.slice(0, filters.limit);
    }

    return filteredMetrics;
  }

  // Get slow operations (above threshold)
  public getSlowOperations(thresholdMs: number = 1000): PerformanceMetric[] {
    return this.metrics.filter(m => m.duration > thresholdMs);
  }

  // Get operations by user
  public getMetricsByUser(userId: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.userId === userId);
  }

  // Clear old metrics (for maintenance)
  public clearOldMetrics(olderThanDays: number = 7): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    this.metrics = this.metrics.filter(metric => 
      new Date(metric.timestamp) > cutoffDate
    );
  }

  // Export metrics (for analysis)
  public exportMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Get active timers
  public getActiveTimers(): Array<{ id: string; operation: string; duration: number; metadata?: Record<string, any> }> {
    const now = performance.now();
    return Array.from(this.activeTimers.entries()).map(([id, timer]) => ({
      id,
      operation: timer.operation,
      duration: now - timer.startTime,
      metadata: timer.metadata
    }));
  }
}

// Create singleton instance
export const performanceService = new PerformanceService();

export default performanceService;
