"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditService = exports.AuditService = void 0;
const logger_1 = require("../utils/logger");
class AuditService {
    events = [];
    logUserAction(request, userId, action, resource, details = {}) {
        const event = {
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
        logger_1.auditLogger.info('User action logged', event);
    }
    logSystemEvent(request, action, details = {}) {
        const event = {
            id: this.generateId(),
            action,
            resource: 'system',
            timestamp: new Date(),
            details,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
        };
        this.events.push(event);
        logger_1.auditLogger.info('System event logged', event);
    }
    getEvents(filters = {}) {
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
    getAuditStats() {
        const stats = {
            totalEvents: this.events.length,
            eventsByAction: {},
            eventsByResource: {},
            eventsByUser: {},
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
    generateId() {
        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.AuditService = AuditService;
exports.auditService = new AuditService();
//# sourceMappingURL=auditService.js.map