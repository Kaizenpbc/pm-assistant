import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AILearningServiceV2 } from '../services/aiLearningService';
import { AIFeedbackRecordSchema, AIAccuracyRecordSchema } from '../schemas/phase5Schemas';

export async function learningRoutes(fastify: FastifyInstance) {
  const service = new AILearningServiceV2(fastify);

  // POST /feedback — Record user feedback on AI suggestions
  fastify.post(
    '/feedback',
    async (
      request: FastifyRequest<{ Body: { feature: string; projectId?: string; userAction: string; suggestionData?: any; modifiedData?: any; feedbackText?: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const parsed = AIFeedbackRecordSchema.parse(request.body);
        const userId = (request as any).userId || 'anonymous';
        service.recordFeedback(parsed, userId);
        return reply.send({ success: true });
      } catch (err) {
        fastify.log.error({ err }, 'Failed to record feedback');
        return reply.status(400).send({ error: 'Invalid feedback data' });
      }
    },
  );

  // POST /accuracy — Record prediction accuracy
  fastify.post(
    '/accuracy',
    async (
      request: FastifyRequest<{ Body: any }>,
      reply: FastifyReply,
    ) => {
      try {
        const parsed = AIAccuracyRecordSchema.parse(request.body);
        service.recordAccuracy(parsed);
        return reply.send({ success: true });
      } catch (err) {
        fastify.log.error({ err }, 'Failed to record accuracy');
        return reply.status(400).send({ error: 'Invalid accuracy data' });
      }
    },
  );

  // GET /accuracy-report — Get accuracy report with optional filters
  fastify.get(
    '/accuracy-report',
    async (
      request: FastifyRequest<{ Querystring: { projectType?: string; regionId?: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { projectType, regionId } = request.query;
        const report = await service.getAccuracyReport({ projectType, regionId });
        return reply.send({ data: report });
      } catch (err) {
        fastify.log.error({ err }, 'Failed to get accuracy report');
        return reply.status(500).send({ error: 'Failed to generate accuracy report' });
      }
    },
  );

  // GET /feedback-stats — Get feedback statistics
  fastify.get(
    '/feedback-stats',
    async (
      request: FastifyRequest<{ Querystring: { feature?: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { feature } = request.query;
        const stats = await service.getFeedbackStats(feature);
        return reply.send({ data: stats });
      } catch (err) {
        fastify.log.error({ err }, 'Failed to get feedback stats');
        return reply.status(500).send({ error: 'Failed to get feedback statistics' });
      }
    },
  );

  // GET /insights — AI-enhanced accuracy insights
  fastify.get(
    '/insights',
    async (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      try {
        const userId = (request as any).userId || undefined;
        const { insights, aiPowered } = await service.getAIAccuracyInsights(userId);
        return reply.send({ data: insights, aiPowered });
      } catch (err) {
        fastify.log.error({ err }, 'Failed to get AI insights');
        return reply.status(500).send({ error: 'Failed to generate AI insights' });
      }
    },
  );
}
