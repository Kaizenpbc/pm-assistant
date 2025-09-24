import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
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
  workEffort: z.string().optional(),
  dependency: z.string().optional(),
  risks: z.string().optional(),
  issues: z.string().optional(),
  comments: z.string().optional(),
});

const updateTaskSchema = createTaskSchema.partial().omit({ scheduleId: true });

export async function scheduleRoutes(fastify: FastifyInstance) {
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
      
      const schedules = await databaseService.query(
        'SELECT * FROM project_schedules WHERE project_id = ? ORDER BY created_at DESC',
        [projectId]
      );
      
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
      
      const scheduleId = crypto.randomUUID();
      const createdBy = user?.userId || 'admin-001'; // Use admin user ID as fallback when no auth
      
      // Check if project exists, if not create it
      const existingProject = await databaseService.query(
        'SELECT id FROM projects WHERE id = ?',
        [scheduleData.projectId]
      );
      
      if (existingProject.length === 0) {
        // Create the Dartmouth project if it doesn't exist
        if (scheduleData.projectId === '3') {
          await databaseService.query(
            `INSERT INTO projects (id, code, name, description, status, priority, budget_allocated, budget_spent, currency, start_date, end_date, project_manager_id, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              '3',
              'DES-2024',
              'Dartmouth Essequibo School Construction',
              'Construction of a new primary school in Dartmouth, Essequibo to serve the local community',
              'planning',
              'high',
              2500000,
              0,
              'USD',
              '2024-06-01',
              '2025-12-31',
              'admin-001',
              'admin-001'
            ]
          );
        } else {
          return reply.status(400).send({
            error: 'Project not found',
            message: `Project with ID ${scheduleData.projectId} does not exist`,
          });
        }
      }
      
      await databaseService.query(
        `INSERT INTO project_schedules (id, project_id, name, description, start_date, end_date, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          scheduleId,
          scheduleData.projectId,
          scheduleData.name,
          scheduleData.description || '',
          scheduleData.startDate,
          scheduleData.endDate,
          createdBy,
        ]
      );
      
      const schedule = await databaseService.query(
        'SELECT * FROM project_schedules WHERE id = ?',
        [scheduleId]
      );
      
      return reply.status(201).send({ schedule: schedule[0] });
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
    // preHandler: [authMiddleware], // Temporarily disabled for testing
    schema: {
      description: 'Update a schedule',
      tags: ['schedules'],
      // security: [{ cookieAuth: [] }], // Temporarily disabled for testing
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
      
      const updateFields = [];
      const updateValues = [];
      
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbKey = key === 'projectId' ? 'project_id' : 
                       key === 'startDate' ? 'start_date' :
                       key === 'endDate' ? 'end_date' : key;
          updateFields.push(`${dbKey} = ?`);
          updateValues.push(value);
        }
      });
      
      if (updateFields.length === 0) {
        return reply.status(400).send({
          error: 'Bad request',
          message: 'No fields to update',
        });
      }
      
      updateValues.push(scheduleId);
      
      await databaseService.query(
        `UPDATE project_schedules SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        updateValues
      );
      
      const schedule = await databaseService.query(
        'SELECT * FROM project_schedules WHERE id = ?',
        [scheduleId]
      );
      
      return { schedule: schedule[0] };
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
      
      const tasks = await databaseService.query(
        'SELECT * FROM tasks WHERE schedule_id = ? ORDER BY created_at ASC',
        [scheduleId]
      );
      
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
      
      console.log('=== SERVER RECEIVED TASK DATA ===');
      console.log('Request body:', JSON.stringify(request.body, null, 2));
      console.log('Schedule ID:', scheduleId);
      
      let taskData;
      try {
        taskData = createTaskSchema.omit({ scheduleId: true }).parse(request.body);
        console.log('Parsed task data:', JSON.stringify(taskData, null, 2));
      } catch (validationError) {
        console.error('=== VALIDATION ERROR ===');
        console.error('Validation error:', validationError);
        return reply.status(400).send({
          success: false,
          message: 'Invalid task data',
          error: validationError
        });
      }
      
      const taskId = crypto.randomUUID();
      const createdBy = user?.userId || 'admin-001'; // Use admin user ID as fallback when no auth
      
      await databaseService.query(
        `INSERT INTO tasks (id, schedule_id, name, description, status, priority, assigned_to, due_date, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          taskId,
          scheduleId,
          taskData.name,
          taskData.description || '',
          taskData.status,
          taskData.priority,
          taskData.assignedTo || null,
          taskData.dueDate || null,
          createdBy,
        ]
      );
      
      const task = await databaseService.query(
        'SELECT * FROM tasks WHERE id = ?',
        [taskId]
      );
      
      return reply.status(201).send({ task: task[0] });
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
    // preHandler: [authMiddleware], // Temporarily disabled for testing
    schema: {
      description: 'Update a task',
      tags: ['schedules'],
      // security: [{ cookieAuth: [] }], // Temporarily disabled for testing
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
      
      const updateFields = [];
      const updateValues = [];
      
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbKey = key === 'assignedTo' ? 'assigned_to' : 
                       key === 'dueDate' ? 'due_date' : key;
          updateFields.push(`${dbKey} = ?`);
          updateValues.push(value);
        }
      });
      
      if (updateFields.length === 0) {
        return reply.status(400).send({
          error: 'Bad request',
          message: 'No fields to update',
        });
      }
      
      updateValues.push(taskId);
      
      await databaseService.query(
        `UPDATE tasks SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        updateValues
      );
      
      const task = await databaseService.query(
        'SELECT * FROM tasks WHERE id = ?',
        [taskId]
      );
      
      return { task: task[0] };
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
      
      // Delete all tasks first (due to foreign key constraint)
      await databaseService.query(
        'DELETE FROM tasks WHERE schedule_id = ?',
        [scheduleId]
      );
      
      // Delete the schedule
      await databaseService.query(
        'DELETE FROM project_schedules WHERE id = ?',
        [scheduleId]
      );
      
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
