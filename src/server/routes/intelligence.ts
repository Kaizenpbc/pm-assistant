import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AnomalyDetectionService } from '../services/anomalyDetectionService';
import { CrossProjectIntelligenceService } from '../services/crossProjectIntelligenceService';
import { WhatIfScenarioService } from '../services/whatIfScenarioService';
import { AIScenarioRequestSchema } from '../schemas/phase5Schemas';

export async function intelligenceRoutes(fastify: FastifyInstance) {
  const anomalyService = new AnomalyDetectionService(fastify);
  const crossProjectService = new CrossProjectIntelligenceService(fastify);
  const scenarioService = new WhatIfScenarioService(fastify);

  // -----------------------------------------------------------------------
  // 5.4 — Anomaly Detection
  // -----------------------------------------------------------------------

  // GET /anomalies — Portfolio-wide anomaly scan
  fastify.get(
    '/anomalies',
    async (
      request: FastifyRequest<{ Querystring: { regionId?: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { regionId } = request.query;
        const userId = (request as any).userId || undefined;
        const report = await anomalyService.detectPortfolioAnomalies(regionId, userId);
        return reply.send({ data: report, aiPowered: report.aiPowered });
      } catch (err) {
        fastify.log.error({ err }, 'Portfolio anomaly detection failed');
        return reply.status(500).send({ error: 'Failed to detect anomalies' });
      }
    },
  );

  // GET /anomalies/project/:projectId — Single project anomaly scan
  fastify.get(
    '/anomalies/project/:projectId',
    async (
      request: FastifyRequest<{ Params: { projectId: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { projectId } = request.params;
        const userId = (request as any).userId || undefined;
        const report = await anomalyService.detectProjectAnomalies(projectId, userId);
        return reply.send({ data: report, aiPowered: report.aiPowered });
      } catch (err) {
        fastify.log.error({ err }, 'Project anomaly detection failed');
        return reply.status(500).send({ error: 'Failed to detect project anomalies' });
      }
    },
  );

  // -----------------------------------------------------------------------
  // 5.3 — Cross-Project Intelligence
  // -----------------------------------------------------------------------

  // GET /cross-project — Full portfolio analysis
  fastify.get(
    '/cross-project',
    async (
      request: FastifyRequest<{ Querystring: { regionId?: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { regionId } = request.query;
        const userId = (request as any).userId || undefined;
        const { insight, aiPowered } = await crossProjectService.analyzePortfolio(regionId, userId);
        return reply.send({ data: insight, aiPowered });
      } catch (err) {
        fastify.log.error({ err }, 'Cross-project analysis failed');
        return reply.status(500).send({ error: 'Failed to analyze cross-project intelligence' });
      }
    },
  );

  // GET /cross-project/similar/:projectId — Find similar completed projects
  fastify.get(
    '/cross-project/similar/:projectId',
    async (
      request: FastifyRequest<{ Params: { projectId: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { projectId } = request.params;
        const userId = (request as any).userId || undefined;
        const { similar, aiPowered } = await crossProjectService.findSimilarProjects(projectId, userId);
        return reply.send({ data: similar, aiPowered });
      } catch (err) {
        fastify.log.error({ err }, 'Similar projects search failed');
        return reply.status(500).send({ error: 'Failed to find similar projects' });
      }
    },
  );

  // -----------------------------------------------------------------------
  // 5.2 — What-If Scenarios
  // -----------------------------------------------------------------------

  // POST /scenarios — Model a scenario
  fastify.post(
    '/scenarios',
    async (
      request: FastifyRequest<{ Body: any }>,
      reply: FastifyReply,
    ) => {
      try {
        const parsed = AIScenarioRequestSchema.parse(request.body);
        const userId = (request as any).userId || undefined;
        const { result, aiPowered } = await scenarioService.modelScenario(parsed, userId);
        return reply.send({ data: result, aiPowered });
      } catch (err) {
        if (err instanceof Error && err.name === 'ZodError') {
          return reply.status(400).send({ error: 'Invalid scenario request data' });
        }
        fastify.log.error({ err }, 'Scenario modeling failed');
        return reply.status(500).send({ error: 'Failed to model scenario' });
      }
    },
  );
}
