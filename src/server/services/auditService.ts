import { FastifyRequest } from 'fastify';
import { auditLogger } from '../utils/logger';

export interface AuditEvent {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  timestamp: Date;
  details: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export class AuditService {
  private events: AuditEvent[] = [];

  public logUserAction(
    request: FastifyRequest,
    userId: string,
    action: string,
    resource: string,
    details: Record<string, any> = {}
  ): void {
    const event: AuditEvent = {
      id: this.generateId(),
      userId,
      action,
      resource,
      timestamp: new Date(),
      details,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    };

    this.events.push(event);
    auditLogger.info('User action logged', event);
  }

  public logSystemEvent(
    request: FastifyRequest,
    action: string,
    details: Record<string, any> = {}
  ): void {
    const event: AuditEvent = {
      id: this.generateId(),
      action,
      resource: 'system',
      timestamp: new Date(),
      details,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    };

    this.events.push(event);
    auditLogger.info('System event logged', event);
  }

  public getEvents(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}): AuditEvent[] {
    let filteredEvents = [...this.events];

    if (filters.userId) {
      filteredEvents = filteredEvents.filter(e => e.userId === filters.userId);
    }

    if (filters.action) {
      filteredEvents = filteredEvents.filter(e => e.action === filters.action);
    }

    if (filters.resource) {
      filteredEvents = filteredEvents.filter(e => e.resource === filters.resource);
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredEvents = filteredEvents.filter(e => e.timestamp >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filteredEvents = filteredEvents.filter(e => e.timestamp <= endDate);
    }

    if (filters.limit) {
      filteredEvents = filteredEvents.slice(-filters.limit);
    }

    return filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public getAuditStats(): {
    totalEvents: number;
    eventsByAction: Record<string, number>;
    eventsByResource: Record<string, number>;
    eventsByUser: Record<string, number>;
  } {
    const stats = {
      totalEvents: this.events.length,
      eventsByAction: {} as Record<string, number>,
      eventsByResource: {} as Record<string, number>,
      eventsByUser: {} as Record<string, number>,
    };

    this.events.forEach(event => {
      stats.eventsByAction[event.action] = (stats.eventsByAction[event.action] || 0) + 1;
      stats.eventsByResource[event.resource] = (stats.eventsByResource[event.resource] || 0) + 1;
      if (event.userId) {
        stats.eventsByUser[event.userId] = (stats.eventsByUser[event.userId] || 0) + 1;
      }
    });

    return stats;
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const auditService = new AuditService();
