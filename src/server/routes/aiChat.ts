import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AIChatService } from '../services/aiChatService';
import { AIProjectCreatorService } from '../services/aiProjectCreator';
import { claudeService, promptTemplates } from '../services/claudeService';
import { AIMeetingExtractionSchema } from '../schemas/aiSchemas';
import { ScheduleService } from '../services/ScheduleService';
import { logAIUsage } from '../services/aiUsageLogger';

export async function aiChatRoutes(fastify: FastifyInstance) {
  const chatService = new AIChatService(fastify);
  const projectCreator = new AIProjectCreatorService(fastify);
  const scheduleService = new ScheduleService();

  // -----------------------------------------------------------------------
  // POST /message — non-streaming chat
  // -----------------------------------------------------------------------
  fastify.post('/message', {
    schema: {
      description: 'Send a message to the AI assistant (non-streaming)',
      tags: ['ai-chat'],
      body: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', minLength: 1 },
          conversationId: { type: 'string' },
          context: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['dashboard', 'project', 'schedule', 'region', 'reports', 'general'] },
              projectId: { type: 'string' },
              regionId: { type: 'string' },
            },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = request.body as any;
        const user = (request as any).user || {};

        const result = await chatService.sendMessage({
          message: body.message,
          conversationId: body.conversationId,
          context: body.context,
          userId: user.userId || 'anonymous',
          userRole: user.role || 'user',
        });

        return result;
      } catch (error) {
        fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Chat message failed');
        return reply.code(500).send({
          error: 'Failed to process message',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  // -----------------------------------------------------------------------
  // POST /stream — SSE streaming chat
  // -----------------------------------------------------------------------
  fastify.post('/stream', {
    schema: {
      description: 'Send a message to the AI assistant (SSE streaming)',
      tags: ['ai-chat'],
      body: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', minLength: 1 },
          conversationId: { type: 'string' },
          context: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['dashboard', 'project', 'schedule', 'region', 'reports', 'general'] },
              projectId: { type: 'string' },
              regionId: { type: 'string' },
            },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = request.body as any;
        const user = (request as any).user || {};

        // Set SSE headers
        reply.raw.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        });

        const stream = chatService.streamMessage({
          message: body.message,
          conversationId: body.conversationId,
          context: body.context,
          userId: user.userId || 'anonymous',
          userRole: user.role || 'user',
        });

        for await (const chunk of stream) {
          const data = JSON.stringify(chunk);
          reply.raw.write(`data: ${data}\n\n`);
        }

        reply.raw.end();
      } catch (error) {
        fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Chat stream failed');

        // If headers haven't been sent yet, send error response
        if (!reply.raw.headersSent) {
          return reply.code(500).send({
            error: 'Failed to stream message',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }

        // If streaming already started, send error as SSE event
        reply.raw.write(`data: ${JSON.stringify({ type: 'error', content: 'Stream interrupted' })}\n\n`);
        reply.raw.end();
      }
    },
  });

  // -----------------------------------------------------------------------
  // GET /conversations — list user's conversations
  // -----------------------------------------------------------------------
  fastify.get('/conversations', {
    schema: {
      description: 'List user conversations',
      tags: ['ai-chat'],
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user || {};
        const conversations = await chatService.getConversations(user.userId || 'anonymous');
        return { conversations };
      } catch (error) {
        fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Failed to list conversations');
        return reply.code(500).send({
          error: 'Failed to list conversations',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  // -----------------------------------------------------------------------
  // GET /conversations/:id — load a conversation
  // -----------------------------------------------------------------------
  fastify.get('/conversations/:id', {
    schema: {
      description: 'Load a conversation by ID',
      tags: ['ai-chat'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as any;
        const user = (request as any).user || {};
        const conversation = await chatService.getConversation(id, user.userId || 'anonymous');

        if (!conversation) {
          return reply.code(404).send({ error: 'Conversation not found' });
        }

        return { conversation };
      } catch (error) {
        fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Failed to load conversation');
        return reply.code(500).send({
          error: 'Failed to load conversation',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  // -----------------------------------------------------------------------
  // DELETE /conversations/:id — soft-delete a conversation
  // -----------------------------------------------------------------------
  fastify.delete('/conversations/:id', {
    schema: {
      description: 'Delete a conversation (soft-delete)',
      tags: ['ai-chat'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as any;
        const user = (request as any).user || {};
        const deleted = await chatService.deleteConversation(id, user.userId || 'anonymous');

        if (!deleted) {
          return reply.code(404).send({ error: 'Conversation not found' });
        }

        return { message: 'Conversation deleted' };
      } catch (error) {
        fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Failed to delete conversation');
        return reply.code(500).send({
          error: 'Failed to delete conversation',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  // -----------------------------------------------------------------------
  // POST /create-project — create project from natural language description
  // -----------------------------------------------------------------------
  fastify.post('/create-project', {
    schema: {
      description: 'Create a project from a natural language description',
      tags: ['ai-chat'],
      body: {
        type: 'object',
        required: ['description'],
        properties: {
          description: { type: 'string', minLength: 10 },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = request.body as any;
        const user = (request as any).user || {};

        const result = await projectCreator.createProjectFromDescription(
          body.description,
          user.userId || 'anonymous',
        );

        return {
          project: result.project,
          schedule: result.schedule,
          tasks: result.tasks,
          analysis: result.analysis,
          aiPowered: result.aiPowered,
        };
      } catch (error) {
        fastify.log.error(
          { err: error instanceof Error ? error : new Error(String(error)) },
          'NL project creation failed',
        );
        return reply.code(500).send({
          error: 'Failed to create project from description',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  // -----------------------------------------------------------------------
  // POST /extract-tasks — extract tasks from meeting notes
  // -----------------------------------------------------------------------
  fastify.post('/extract-tasks', {
    schema: {
      description: 'Extract tasks and action items from meeting notes',
      tags: ['ai-chat'],
      body: {
        type: 'object',
        required: ['meetingNotes'],
        properties: {
          meetingNotes: { type: 'string', minLength: 10 },
          projectId: { type: 'string' },
          scheduleId: { type: 'string' },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = request.body as any;
        const user = (request as any).user || {};
        const userId = user.userId || 'anonymous';

        if (!claudeService.isAvailable()) {
          return reply.code(503).send({
            error: 'AI features are currently disabled',
            message: 'Meeting notes extraction requires AI to be enabled.',
            aiPowered: false,
          });
        }

        let additionalContext = '';
        if (body.projectId) {
          additionalContext = `This meeting is related to project ID: ${body.projectId}`;
        }

        const systemPrompt = promptTemplates.meetingNotesExtraction.render({
          meetingNotes: body.meetingNotes,
          additionalContext,
        });

        const result = await claudeService.completeWithJsonSchema({
          systemPrompt,
          userMessage:
            'Extract all action items, decisions, tasks, and follow-ups from these meeting notes. Return valid JSON matching the requested schema.',
          schema: AIMeetingExtractionSchema,
          temperature: 0.2,
        });

        logAIUsage(fastify, {
          userId,
          feature: 'meeting-extraction',
          model: 'claude',
          usage: result.usage,
          latencyMs: result.latencyMs,
          success: true,
          requestContext: { projectId: body.projectId, scheduleId: body.scheduleId },
        });

        // If a scheduleId is provided, create the extracted tasks in that schedule
        let createdTasks: any[] = [];
        if (body.scheduleId && result.data.tasks.length > 0) {
          for (const task of result.data.tasks) {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + (task.estimatedDays || 7));

            const created = await scheduleService.createTask({
              scheduleId: body.scheduleId,
              name: task.name,
              description: task.description,
              priority: (task.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
              estimatedDays: task.estimatedDays,
              dueDate,
              createdBy: userId,
            });
            createdTasks.push(created);
          }
        }

        return {
          extraction: result.data,
          createdTasks,
          aiPowered: true,
        };
      } catch (error) {
        fastify.log.error(
          { err: error instanceof Error ? error : new Error(String(error)) },
          'Meeting extraction failed',
        );

        logAIUsage(fastify, {
          userId: ((request as any).user || {}).userId || 'anonymous',
          feature: 'meeting-extraction',
          model: 'claude',
          usage: { inputTokens: 0, outputTokens: 0 },
          latencyMs: 0,
          success: false,
          errorMessage: error instanceof Error ? error.message : String(error),
        });

        return reply.code(500).send({
          error: 'Failed to extract tasks from meeting notes',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });
}
