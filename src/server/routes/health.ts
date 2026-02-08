import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ProjectHealthService, ProjectHealthData } from '../services/ProjectHealthService';

const healthDataSchema = z.object({
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  currentDate: z.string().transform(str => new Date(str)).optional(),
  budgetAllocated: z.number().min(0),
  budgetSpent: z.number().min(0),
  assignedResources: z.number().min(0),
  requiredResources: z.number().min(0),
  highRisks: z.number().min(0),
  mediumRisks: z.number().min(0),
  lowRisks: z.number().min(0),
  completedTasks: z.number().min(0),
  totalTasks: z.number().min(0),
  openIssues: z.number().min(0),
  criticalIssues: z.number().min(0),
  resolvedIssues: z.number().min(0)
});

export async function healthRoutes(fastify: FastifyInstance) {
  const healthService = new ProjectHealthService(fastify);

  // Get project health score
  fastify.get('/health/:projectId', async (request, reply) => {
    try {
      const { projectId } = request.params as { projectId: string };
      
      // TODO: Get actual project data from database
      // For now, return mock data based on project ID
      const mockProjectData: ProjectHealthData = {
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
    } catch (error) {
      fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Error calculating project health');
      return reply.status(500).send({
        success: false,
        error: 'Failed to calculate project health'
      });
    }
  });

  // Calculate health score with custom data
  fastify.post('/health/calculate', async (request, reply) => {
    try {
      const projectData = request.body as ProjectHealthData;

      // Set current date if not provided
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
    } catch (error) {
      fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Error calculating project health');
      return reply.status(500).send({
        success: false,
        error: 'Failed to calculate project health'
      });
    }
  });
}
