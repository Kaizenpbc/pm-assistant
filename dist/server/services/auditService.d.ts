import { FastifyRequest } from 'fastify';
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
export declare class AuditService {
    private events;
    logUserAction(request: FastifyRequest, userId: string, action: string, resource: string, details?: Record<string, any>): void;
    logSystemEvent(request: FastifyRequest, action: string, details?: Record<string, any>): void;
    getEvents(filters?: {
        userId?: string;
        action?: string;
        resource?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): AuditEvent[];
    getAuditStats(): {
        totalEvents: number;
        eventsByAction: Record<string, number>;
        eventsByResource: Record<string, number>;
        eventsByUser: Record<string, number>;
    };
    private generateId;
}
export declare const auditService: AuditService;
//# sourceMappingURL=auditService.d.ts.map