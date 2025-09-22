"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceService = void 0;
const logger_1 = require("../utils/logger");
class PerformanceService {
    metrics = [];
    maxMetrics = 10000;
    activeTimers = new Map();
    generateMetricId() {
        return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getContextFromRequest(req) {
        return {
            requestId: req.requestId,
            userId: req.user?.id
        };
    }
    startTimer(operation, metadata = {}) {
        const timerId = this.generateMetricId();
        this.activeTimers.set(timerId, {
            startTime: performance.now(),
            operation,
            metadata
        });
        return timerId;
    }
    endTimer(timerId, req) {
        const timer = this.activeTimers.get(timerId);
        if (!timer) {
            console.warn(`Timer ${timerId} not found`);
            return null;
        }
        const duration = performance.now() - timer.startTime;
        const memoryUsage = process.memoryUsage();
        const context = req ? this.getContextFromRequest(req) : {};
        const metric = {
            id: timerId,
            timestamp: new Date().toISOString(),
            operation: timer.operation,
            duration,
            memoryUsage,
            requestId: context.requestId,
            userId: context.userId,
            metadata: timer.metadata
        };
        this.metrics.push(metric);
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }
        logger_1.performanceLogger.info('Performance timer completed', {
            operation: timer.operation,
            duration: Date.now() - timer.startTime,
            metadata: timer.metadata
        });
        this.activeTimers.delete(timerId);
        return metric;
    }
    measureAsync(operation, fn, req, metadata = {}) {
        const timerId = this.startTimer(operation, metadata);
        return fn().then((result) => {
            this.endTimer(timerId, req);
            return result;
        }, (error) => {
            this.endTimer(timerId, req);
            throw error;
        });
    }
    measureSync(operation, fn, req, metadata = {}) {
        const timerId = this.startTimer(operation, metadata);
        try {
            const result = fn();
            this.endTimer(timerId, req);
            return result;
        }
        catch (error) {
            this.endTimer(timerId, req);
            throw error;
        }
    }
    measureDatabaseOperation(operation, query, fn, req) {
        return this.measureAsync(`db_${operation}`, fn, req, { query, operation });
    }
    measureEndpoint(endpoint, method, fn, req) {
        return this.measureAsync(`api_${method.toLowerCase()}_${endpoint}`, fn, req, { endpoint, method });
    }
    getStats() {
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
        const slowestOperation = this.metrics.reduce((slowest, current) => current.duration > slowest.duration ? current : slowest);
        const fastestOperation = this.metrics.reduce((fastest, current) => current.duration < fastest.duration ? current : fastest);
        const operationsByType = {};
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
    getMetrics(filters = {}) {
        let filteredMetrics = [...this.metrics];
        if (filters.operation) {
            filteredMetrics = filteredMetrics.filter(m => m.operation === filters.operation);
        }
        if (filters.startDate) {
            filteredMetrics = filteredMetrics.filter(m => m.timestamp >= filters.startDate);
        }
        if (filters.endDate) {
            filteredMetrics = filteredMetrics.filter(m => m.timestamp <= filters.endDate);
        }
        if (filters.minDuration !== undefined) {
            filteredMetrics = filteredMetrics.filter(m => m.duration >= filters.minDuration);
        }
        if (filters.maxDuration !== undefined) {
            filteredMetrics = filteredMetrics.filter(m => m.duration <= filters.maxDuration);
        }
        filteredMetrics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (filters.limit) {
            filteredMetrics = filteredMetrics.slice(0, filters.limit);
        }
        return filteredMetrics;
    }
    getSlowOperations(thresholdMs = 1000) {
        return this.metrics.filter(m => m.duration > thresholdMs);
    }
    getMetricsByUser(userId) {
        return this.metrics.filter(m => m.userId === userId);
    }
    clearOldMetrics(olderThanDays = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        this.metrics = this.metrics.filter(metric => new Date(metric.timestamp) > cutoffDate);
    }
    exportMetrics() {
        return [...this.metrics];
    }
    getActiveTimers() {
        const now = performance.now();
        return Array.from(this.activeTimers.entries()).map(([id, timer]) => ({
            id,
            operation: timer.operation,
            duration: now - timer.startTime,
            metadata: timer.metadata
        }));
    }
}
exports.performanceService = new PerformanceService();
exports.default = exports.performanceService;
//# sourceMappingURL=performanceService.js.map