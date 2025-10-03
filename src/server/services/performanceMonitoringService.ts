import { FastifyInstance } from 'fastify';
import { PerformanceMonitoringService } from './performanceMonitoring';

let performanceMonitoringService: PerformanceMonitoringService | null = null;

export function getPerformanceMonitoringService(fastify?: FastifyInstance): PerformanceMonitoringService {
  if (!performanceMonitoringService && fastify) {
    performanceMonitoringService = new PerformanceMonitoringService(fastify);
  }
  
  if (!performanceMonitoringService) {
    throw new Error('Performance monitoring service not initialized');
  }
  
  return performanceMonitoringService;
}

export { performanceMonitoringService };
