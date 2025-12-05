import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { ScheduleService } from '../services/ScheduleService';
import { databaseService } from '../database/connection';

const createScheduleSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1, 'Schedule name is required'),
  description: z.string().optional(),
  startDate: z.string().date(),
  endDate: z.string().date(),
});

const updateScheduleSchema = createScheduleSchema.partial();

const createTaskSchema = z.object({
  scheduleId: z.string(),
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignedTo: z.string().optional(),
  dueDate: z.string().date().optional(),
  estimatedDays: z.number().positive().optional(),
  estimatedDurationHours: z.number().positive().optional(),
  actualDurationHours: z.number().positive().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
  workEffort: z.string().optional(),
  dependency: z.string().optional(),
  risks: z.string().optional(),
  issues: z.string().optional(),
  comments: z.string().optional(),
  parentTaskId: z.string().optional(),
});

const updateTaskSchema = createTaskSchema.partial().omit({ scheduleId: true });

export async function scheduleRoutes(fastify: FastifyInstance) {
  const scheduleService = new ScheduleService();

  // Get schedules for a project
  fastify.get('/project/:projectId', {
    schema: {
      description: 'Get all schedules for a project',
      tags: ['schedules'],
      params: {
        type: 'object',
        properties: {
          projectId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            schedules: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  projectId: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  startDate: { type: 'string' },
                  endDate: { type: 'string' },
                  status: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { projectId } = request.params as { projectId: string };

      // Use service instead of direct DB query
      const schedules = await scheduleService.findByProjectId(projectId);

      return { schedules };
    } catch (error) {
      console.error('Get schedules error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to fetch schedules',
      });
    }
  });

  // Create a new schedule
  fastify.post('/', {
    schema: {
      description: 'Create a new schedule',
      tags: ['schedules'],
      body: {
        type: 'object',
        required: ['projectId', 'name', 'startDate', 'endDate'],
        properties: {
          projectId: { type: 'string' },
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            schedule: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                projectId: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                startDate: { type: 'string' },
                endDate: { type: 'string' },
                status: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const scheduleData = createScheduleSchema.parse(request.body);
      const createdBy = user?.userId || 'admin-001';

      const schedule = await scheduleService.create({
        ...scheduleData,
        startDate: new Date(scheduleData.startDate),
        endDate: new Date(scheduleData.endDate),
        createdBy
      });

      return reply.status(201).send({ schedule });
    } catch (error) {
      console.error('Create schedule error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to create schedule',
      });
    }
  });

  // Update a schedule
  fastify.put('/:scheduleId', {
    schema: {
      description: 'Update a schedule',
      tags: ['schedules'],
      params: {
        type: 'object',
        properties: {
          scheduleId: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          projectId: { type: 'string' },
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { scheduleId } = request.params as { scheduleId: string };
      const updateData = updateScheduleSchema.parse(request.body);

      const schedule = await scheduleService.update(scheduleId, {
        ...updateData,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
      });

      if (!schedule) {
        return reply.status(404).send({
          error: 'Not found',
          message: 'Schedule not found'
        });
      }

      return { schedule };
    } catch (error) {
      console.error('Update schedule error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to update schedule',
      });
    }
  });

  // Get tasks for a schedule
  fastify.get('/:scheduleId/tasks', {
    schema: {
      description: 'Get all tasks for a schedule',
      tags: ['schedules'],
      params: {
        type: 'object',
        properties: {
          scheduleId: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { scheduleId } = request.params as { scheduleId: string };

      const tasks = await scheduleService.findTasksByScheduleId(scheduleId);

      return { tasks };
    } catch (error) {
      console.error('Get tasks error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to fetch tasks',
      });
    }
  });

  // Create a new task
  fastify.post('/:scheduleId/tasks', {
    schema: {
      description: 'Create a new task',
      tags: ['schedules'],
      params: {
        type: 'object',
        properties: {
          scheduleId: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          assignedTo: { type: 'string' },
          dueDate: { type: 'string', format: 'date' },
          estimatedDays: { type: 'number', minimum: 1 },
          workEffort: { type: 'string' },
          dependency: { type: 'string' },
          risks: { type: 'string' },
          issues: { type: 'string' },
          comments: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { scheduleId } = request.params as { scheduleId: string };
      const taskData = createTaskSchema.omit({ scheduleId: true }).parse(request.body);
      const createdBy = user?.userId || 'admin-001';

      const task = await scheduleService.createTask({
        scheduleId,
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        startDate: taskData.startDate ? new Date(taskData.startDate) : undefined,
        endDate: taskData.endDate ? new Date(taskData.endDate) : undefined,
        createdBy
      });

      return reply.status(201).send({ task });
    } catch (error) {
      console.error('Create task error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to create task',
      });
    }
  });

  // Update a task
  fastify.put('/:scheduleId/tasks/:taskId', {
    schema: {
      description: 'Update a task',
      tags: ['schedules'],
      params: {
        type: 'object',
        properties: {
          scheduleId: { type: 'string' },
          taskId: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          assignedTo: { type: 'string' },
          dueDate: { type: 'string', format: 'date' },
          estimatedDays: { type: 'number', minimum: 1 },
          workEffort: { type: 'string' },
          dependency: { type: 'string' },
          risks: { type: 'string' },
          issues: { type: 'string' },
          comments: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { taskId } = request.params as { taskId: string };
      const updateData = updateTaskSchema.parse(request.body);

      const task = await scheduleService.updateTask(taskId, {
        ...updateData,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
      });

      if (!task) {
        return reply.status(404).send({
          error: 'Not found',
          message: 'Task not found'
        });
      }

      return { task };
    } catch (error) {
      console.error('Update task error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to update task',
      });
    }
  });

  // Delete a schedule
  fastify.delete('/:scheduleId', {
    schema: {
      description: 'Delete a schedule and all its tasks',
      tags: ['schedules'],
      params: {
        type: 'object',
        properties: {
          scheduleId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { scheduleId } = request.params as { scheduleId: string };

      const deleted = await scheduleService.delete(scheduleId);

      if (!deleted) {
        return reply.status(404).send({
          error: 'Not found',
          message: 'Schedule not found'
        });
      }

      return { message: 'Schedule deleted successfully' };
    } catch (error) {
      console.error('Delete schedule error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to delete schedule',
      });
    }
  });
}
