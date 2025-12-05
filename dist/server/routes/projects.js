"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRoutes = projectRoutes;
const zod_1 = require("zod");
const ProjectService_1 = require("../services/ProjectService");
const auth_1 = require("../middleware/auth");
const createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Project name is required'),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    status: zod_1.z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).default('planning'),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    budgetAllocated: zod_1.z.number().positive().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
const updateProjectSchema = createProjectSchema.partial();
async function projectRoutes(fastify) {
    const projectService = new ProjectService_1.ProjectService();
    fastify.get('/', {
        schema: {
            description: 'Get all projects for the authenticated user',
            tags: ['projects'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        projects: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    status: { type: 'string' },
                                    priority: { type: 'string' },
                                    budgetAllocated: { type: 'number' },
                                    budgetSpent: { type: 'number' },
                                    startDate: { type: 'string' },
                                    endDate: { type: 'string' },
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
            const user = request.user;
            const userId = user?.userId || '1';
            const projects = await projectService.findByUserId(userId);
            return { projects };
        }
        catch (error) {
            console.error('Get projects error:', error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to fetch projects',
            });
        }
    });
    fastify.get('/:id', {
        schema: {
            description: 'Get a specific project by ID',
            tags: ['projects'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        project: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                name: { type: 'string' },
                                description: { type: 'string' },
                                status: { type: 'string' },
                                priority: { type: 'string' },
                                budgetAllocated: { type: 'number' },
                                budgetSpent: { type: 'number' },
                                startDate: { type: 'string' },
                                endDate: { type: 'string' },
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
            const { id } = request.params;
            const user = request.user;
            const userId = user?.userId || '1';
            const project = await projectService.findById(id, userId);
            if (!project) {
                return reply.status(404).send({
                    error: 'Project not found',
                    message: 'Project does not exist or you do not have access',
                });
            }
            return { project };
        }
        catch (error) {
            console.error('Get project error:', error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to fetch project',
            });
        }
    });
    fastify.post('/', {
        preHandler: [auth_1.authMiddleware],
        schema: {
            description: 'Create a new project',
            tags: ['projects'],
            security: [{ cookieAuth: [] }],
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', minLength: 1 },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'] },
                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
                    budgetAllocated: { type: 'number', minimum: 0 },
                    startDate: { type: 'string', format: 'date-time' },
                    endDate: { type: 'string', format: 'date-time' },
                },
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        project: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                name: { type: 'string' },
                                description: { type: 'string' },
                                status: { type: 'string' },
                                priority: { type: 'string' },
                                budgetAllocated: { type: 'number' },
                                budgetSpent: { type: 'number' },
                                startDate: { type: 'string' },
                                endDate: { type: 'string' },
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
            const data = createProjectSchema.parse(request.body);
            const userId = request.user.userId;
            const project = await projectService.create({
                ...data,
                userId,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            });
            return reply.status(201).send({ project });
        }
        catch (error) {
            console.error('Create project error:', error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to create project',
            });
        }
    });
    fastify.put('/:id', {
        preHandler: [auth_1.authMiddleware],
        schema: {
            description: 'Update an existing project',
            tags: ['projects'],
            security: [{ cookieAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                },
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string', minLength: 1 },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'] },
                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
                    budgetAllocated: { type: 'number', minimum: 0 },
                    startDate: { type: 'string', format: 'date-time' },
                    endDate: { type: 'string', format: 'date-time' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        project: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                name: { type: 'string' },
                                description: { type: 'string' },
                                status: { type: 'string' },
                                priority: { type: 'string' },
                                budgetAllocated: { type: 'number' },
                                budgetSpent: { type: 'number' },
                                startDate: { type: 'string' },
                                endDate: { type: 'string' },
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
            const { id } = request.params;
            const data = updateProjectSchema.parse(request.body);
            const userId = request.user.userId;
            const updateData = {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            };
            const project = await projectService.update(id, updateData, userId);
            if (!project) {
                return reply.status(404).send({
                    error: 'Project not found',
                    message: 'Project does not exist or you do not have access',
                });
            }
            return { project };
        }
        catch (error) {
            console.error('Update project error:', error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to update project',
            });
        }
    });
    fastify.delete('/:id', {
        preHandler: [auth_1.authMiddleware],
        schema: {
            description: 'Delete a project',
            tags: ['projects'],
            security: [{ cookieAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
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
            const { id } = request.params;
            const userId = request.user.userId;
            const deleted = await projectService.delete(id, userId);
            if (!deleted) {
                return reply.status(404).send({
                    error: 'Project not found',
                    message: 'Project does not exist or you do not have access',
                });
            }
            return { message: 'Project deleted successfully' };
        }
        catch (error) {
            console.error('Delete project error:', error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to delete project',
            });
        }
    });
}
//# sourceMappingURL=projects.js.map