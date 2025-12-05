"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = healthRoutes;
const zod_1 = require("zod");
const ProjectHealthService_1 = require("../services/ProjectHealthService");
const healthDataSchema = zod_1.z.object({
    startDate: zod_1.z.string().transform(str => new Date(str)),
    endDate: zod_1.z.string().transform(str => new Date(str)),
    currentDate: zod_1.z.string().transform(str => new Date(str)).optional(),
    budgetAllocated: zod_1.z.number().min(0),
    budgetSpent: zod_1.z.number().min(0),
    assignedResources: zod_1.z.number().min(0),
    requiredResources: zod_1.z.number().min(0),
    highRisks: zod_1.z.number().min(0),
    mediumRisks: zod_1.z.number().min(0),
    lowRisks: zod_1.z.number().min(0),
    completedTasks: zod_1.z.number().min(0),
    totalTasks: zod_1.z.number().min(0),
    openIssues: zod_1.z.number().min(0),
    criticalIssues: zod_1.z.number().min(0),
    resolvedIssues: zod_1.z.number().min(0)
});
async function healthRoutes(fastify) {
    const healthService = new ProjectHealthService_1.ProjectHealthService(fastify);
    fastify.get('/health/:projectId', async (request, reply) => {
        try {
            const { projectId } = request.params;
            const mockProjectData = {
                startDate: new Date('2024-01-15'),
                endDate: new Date('2025-12-31'),
                currentDate: new Date(),
                budgetAllocated: 5000000,
                budgetSpent: 1750000,
                assignedResources: 8,
                requiredResources: 10,
                highRisks: 2,
                mediumRisks: 3,
                lowRisks: 1,
                completedTasks: 15,
                totalTasks: 25,
                openIssues: 2,
                criticalIssues: 1,
                resolvedIssues: 5
            };
            const health = healthService.calculateHealthScore(mockProjectData);
            return {
                success: true,
                health: {
                    ...health,
                    lastUpdated: health.lastUpdated.toISOString()
                }
            };
        }
        catch (error) {
            fastify.log.error('Error calculating project health:', error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to calculate project health'
            });
        }
    });
    fastify.post('/health/calculate', async (request, reply) => {
        try {
            const projectData = request.body;
            if (!projectData.currentDate) {
                projectData.currentDate = new Date();
            }
            const health = healthService.calculateHealthScore(projectData);
            return {
                success: true,
                health: {
                    ...health,
                    lastUpdated: health.lastUpdated.toISOString()
                }
            };
        }
        catch (error) {
            fastify.log.error('Error calculating project health:', error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to calculate project health'
            });
        }
    });
}
//# sourceMappingURL=health.js.map