"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMonitoringService = void 0;
exports.getPerformanceMonitoringService = getPerformanceMonitoringService;
const performanceMonitoring_1 = require("./performanceMonitoring");
let performanceMonitoringService = null;
exports.performanceMonitoringService = performanceMonitoringService;
function getPerformanceMonitoringService(fastify) {
    if (!performanceMonitoringService && fastify) {
        exports.performanceMonitoringService = performanceMonitoringService = new performanceMonitoring_1.PerformanceMonitoringService(fastify);
    }
    if (!performanceMonitoringService) {
        throw new Error('Performance monitoring service not initialized');
    }
    return performanceMonitoringService;
}
//# sourceMappingURL=performanceMonitoringService.js.map