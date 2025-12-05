"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleRoutes = scheduleRoutes;
const zod_1 = require("zod");
const ScheduleService_1 = require("../services/ScheduleService");
const createScheduleSchema = zod_1.z.object({
    projectId: zod_1.z.string(),
    name: zod_1.z.string().min(1, 'Schedule name is required'),
    description: zod_1.z.string().optional(),
    startDate: zod_1.z.string().date(),
    endDate: zod_1.z.string().date(),
});
const updateScheduleSchema = createScheduleSchema.partial();
const createTaskSchema = zod_1.z.object({
    scheduleId: zod_1.z.string(),
    name: zod_1.z.string().min(1, 'Task name is required'),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    assignedTo: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().date().optional(),
    estimatedDays: zod_1.z.number().positive().optional(),
    estimatedDurationHours: zod_1.z.number().positive().optional(),
    actualDurationHours: zod_1.z.number().positive().optional(),
    startDate: zod_1.z.string().date().optional(),
    endDate: zod_1.z.string().date().optional(),
    progressPercentage: zod_1.z.number().min(0).max(100).optional(),
    workEffort: zod_1.z.string().optional(),
    dependency: zod_1.z.string().optional(),
    risks: zod_1.z.string().optional(),
    issues: zod_1.z.string().optional(),
    comments: zod_1.z.string().optional(),
    parentTaskId: zod_1.z.string().optional(),
});
const updateTaskSchema = createTaskSchema.partial().omit({ scheduleId: true });
async function scheduleRoutes(fastify) {
    const scheduleService = new ScheduleService_1.ScheduleService();
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
    }, async (request, reply) => {
        try {
            const { projectId } = request.params;
            const schedules = await scheduleService.findByProjectId(projectId);
            return { schedules };
        }
        catch (error) {
            console.error('Get schedules error:', error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to fetch schedules',
            });
        }
    });
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
    }, async (request, reply) => {
        try {
            const user = request.user;
            const scheduleData = createScheduleSchema.parse(request.body);
            const createdBy = user?.userId || 'admin-001';
            const schedule = await scheduleService.create({
                ...scheduleData,
                startDate: new Date(scheduleData.startDate),
                endDate: new Date(scheduleData.endDate),
                createdBy
            });
            return reply.status(201).send({ schedule });
        }
        catch (error) {
            console.error('Create schedule error:', error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to create schedule',
            });
        }
    });
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
    }, async (request, reply) => {
        try {
            const { scheduleId } = request.params;
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
        }
        catch (error) {
            console.error('Update schedule error:', error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to update schedule',
            });
        }
    });
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
    }, async (request, reply) => {
        try {
            const { scheduleId } = request.params;
            const tasks = await scheduleService.findTasksByScheduleId(scheduleId);
            return { tasks };
        }
        catch (error) {
            console.error('Get tasks error:', error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to fetch tasks',
            });
        }
    });
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
    }, async (request, reply) => {
        try {
            const user = request.user;
            const { scheduleId } = request.params;
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
        }
        catch (error) {
            console.error('Create task error:', error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to create task',
            });
        }
    });
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
    }, async (request, reply) => {
        try {
            const { taskId } = request.params;
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
        }
        catch (error) {
            console.error('Update task error:', error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to update task',
            });
        }
    });
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
    }, async (request, reply) => {
        try {
            const { scheduleId } = request.params;
            const deleted = await scheduleService.delete(scheduleId);
            if (!deleted) {
                return reply.status(404).send({
                    error: 'Not found',
                    message: 'Schedule not found'
                });
            }
            return { message: 'Schedule deleted successfully' };
        }
        catch (error) {
            console.error('Delete schedule error:', error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to delete schedule',
            });
        }
    });
}
//# sourceMappingURL=schedules.js.map