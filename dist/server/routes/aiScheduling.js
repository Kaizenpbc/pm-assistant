"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiSchedulingRoutes = aiSchedulingRoutes;
const aiTaskBreakdown_1 = require("../services/aiTaskBreakdown");
const analyzeProjectSchema = {
    description: 'Analyze project and generate AI task breakdown',
    tags: ['ai-scheduling'],
    body: {
        type: 'object',
        required: ['projectDescription'],
        properties: {
            projectDescription: { type: 'string', minLength: 10 },
            projectType: { type: 'string' },
            existingTasks: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' }
                    }
                }
            }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                analysis: {
                    type: 'object',
                    properties: {
                        projectType: { type: 'string' },
                        complexity: { type: 'string', enum: ['low', 'medium', 'high'] },
                        estimatedDuration: { type: 'number' },
                        riskLevel: { type: 'number' },
                        suggestedPhases: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    estimatedDays: { type: 'number' },
                                    tasks: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string' },
                                                name: { type: 'string' },
                                                description: { type: 'string' },
                                                estimatedDays: { type: 'number' },
                                                complexity: { type: 'string', enum: ['low', 'medium', 'high'] },
                                                priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
                                                dependencies: {
                                                    type: 'array',
                                                    items: { type: 'string' }
                                                },
                                                riskLevel: { type: 'number' },
                                                category: { type: 'string' },
                                                skills: {
                                                    type: 'array',
                                                    items: { type: 'string' }
                                                },
                                                deliverables: {
                                                    type: 'array',
                                                    items: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        taskSuggestions: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    estimatedDays: { type: 'number' },
                                    complexity: { type: 'string', enum: ['low', 'medium', 'high'] },
                                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
                                    dependencies: {
                                        type: 'array',
                                        items: { type: 'string' }
                                    },
                                    riskLevel: { type: 'number' },
                                    category: { type: 'string' },
                                    skills: {
                                        type: 'array',
                                        items: { type: 'string' }
                                    },
                                    deliverables: {
                                        type: 'array',
                                        items: { type: 'string' }
                                    }
                                }
                            }
                        },
                        criticalPath: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        resourceRequirements: {
                            type: 'object',
                            properties: {
                                developers: { type: 'number' },
                                designers: { type: 'number' },
                                testers: { type: 'number' },
                                managers: { type: 'number' }
                            }
                        }
                    }
                },
                insights: {
                    type: 'object',
                    properties: {
                        recommendations: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        warnings: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        optimizations: {
                            type: 'array',
                            items: { type: 'string' }
                        }
                    }
                }
            }
        }
    }
};
const suggestTaskDependenciesSchema = {
    description: 'Suggest task dependencies based on project context',
    tags: ['ai-scheduling'],
    body: {
        type: 'object',
        required: ['tasks'],
        properties: {
            tasks: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        category: { type: 'string' }
                    }
                }
            },
            projectContext: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                dependencies: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            fromTask: { type: 'string' },
                            toTask: { type: 'string' },
                            type: { type: 'string', enum: ['finish-to-start', 'start-to-start', 'finish-to-finish'] },
                            confidence: { type: 'number' },
                            reason: { type: 'string' }
                        }
                    }
                }
            }
        }
    }
};
const optimizeScheduleSchema = {
    description: 'Optimize existing schedule using AI',
    tags: ['ai-scheduling'],
    body: {
        type: 'object',
        required: ['scheduleId'],
        properties: {
            scheduleId: { type: 'string' },
            optimizationGoals: {
                type: 'array',
                items: { type: 'string', enum: ['minimize-duration', 'balance-resources', 'reduce-risk', 'maximize-quality'] }
            },
            constraints: {
                type: 'object',
                properties: {
                    maxDuration: { type: 'number' },
                    availableResources: { type: 'object' },
                    deadline: { type: 'string', format: 'date' }
                }
            }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                optimizedSchedule: {
                    type: 'object',
                    properties: {
                        tasks: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    suggestedStartDate: { type: 'string', format: 'date' },
                                    suggestedEndDate: { type: 'string', format: 'date' },
                                    suggestedAssignee: { type: 'string' },
                                    optimizationReason: { type: 'string' }
                                }
                            }
                        },
                        improvements: {
                            type: 'object',
                            properties: {
                                durationReduction: { type: 'number' },
                                riskReduction: { type: 'number' },
                                resourceUtilization: { type: 'number' }
                            }
                        }
                    }
                }
            }
        }
    }
};
async function aiSchedulingRoutes(fastify) {
    const aiService = new aiTaskBreakdown_1.AITaskBreakdownService(fastify);
    fastify.post('/analyze-project', {
        schema: analyzeProjectSchema,
        handler: async (request, reply) => {
            try {
                const { projectDescription, projectType, existingTasks } = request.body;
                fastify.log.info('AI Project Analysis Request', {
                    projectType,
                    descriptionLength: projectDescription.length,
                    existingTasksCount: existingTasks?.length || 0
                });
                const analysis = await aiService.analyzeProject(projectDescription, projectType);
                const insights = generateInsights(analysis, existingTasks);
                return {
                    analysis,
                    insights
                };
            }
            catch (error) {
                fastify.log.error('Error in AI project analysis:', error);
                return reply.code(500).send({
                    error: 'Failed to analyze project',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    });
    fastify.post('/suggest-dependencies', {
        schema: suggestTaskDependenciesSchema,
        handler: async (request, reply) => {
            try {
                const { tasks, projectContext } = request.body;
                fastify.log.info('AI Dependency Suggestion Request', {
                    tasksCount: tasks.length,
                    hasProjectContext: !!projectContext
                });
                const dependencies = generateDependencySuggestions(tasks, projectContext);
                return { dependencies };
            }
            catch (error) {
                fastify.log.error('Error in AI dependency suggestion:', error);
                return reply.code(500).send({
                    error: 'Failed to suggest dependencies',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    });
    fastify.post('/optimize-schedule', {
        schema: optimizeScheduleSchema,
        handler: async (request, reply) => {
            try {
                const { scheduleId, optimizationGoals, constraints } = request.body;
                fastify.log.info('AI Schedule Optimization Request', {
                    scheduleId,
                    optimizationGoals,
                    constraints
                });
                const optimizedSchedule = await optimizeSchedule(scheduleId, optimizationGoals, constraints, fastify);
                return { optimizedSchedule };
            }
            catch (error) {
                fastify.log.error('Error in AI schedule optimization:', error);
                return reply.code(500).send({
                    error: 'Failed to optimize schedule',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    });
    fastify.get('/insights/:projectId', {
        schema: {
            description: 'Get AI insights for existing project',
            tags: ['ai-scheduling'],
            params: {
                type: 'object',
                properties: {
                    projectId: { type: 'string' }
                }
            }
        },
        handler: async (request, reply) => {
            try {
                const { projectId } = request.params;
                fastify.log.info('AI Insights Request', { projectId });
                const insights = await generateProjectInsights(projectId, fastify);
                return { insights };
            }
            catch (error) {
                fastify.log.error('Error generating AI insights:', error);
                return reply.code(500).send({
                    error: 'Failed to generate insights',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    });
    fastify.post('/feedback', {
        schema: {
            description: 'Record user feedback for AI learning',
            tags: ['ai-scheduling'],
            body: {
                type: 'object',
                required: ['projectType', 'projectDescription', 'generatedTasks', 'userFeedback'],
                properties: {
                    projectType: { type: 'string' },
                    projectDescription: { type: 'string' },
                    generatedTasks: {
                        type: 'array',
                        items: { type: 'object' }
                    },
                    userFeedback: {
                        type: 'object',
                        required: ['acceptedTasks', 'rejectedTasks', 'modifiedTasks'],
                        properties: {
                            acceptedTasks: {
                                type: 'array',
                                items: { type: 'string' }
                            },
                            rejectedTasks: {
                                type: 'array',
                                items: { type: 'string' }
                            },
                            modifiedTasks: {
                                type: 'array',
                                items: { type: 'object' }
                            },
                            actualDurations: {
                                type: 'object',
                                additionalProperties: { type: 'number' }
                            },
                            actualComplexities: {
                                type: 'object',
                                additionalProperties: { type: 'string' }
                            }
                        }
                    }
                }
            }
        },
        handler: async (request, reply) => {
            try {
                const feedbackData = request.body;
                fastify.log.info('AI Feedback Recording Request', {
                    projectType: feedbackData.projectType,
                    acceptedTasks: feedbackData.userFeedback.acceptedTasks.length,
                    rejectedTasks: feedbackData.userFeedback.rejectedTasks.length
                });
                await aiService.recordFeedback(feedbackData);
                return { message: 'Feedback recorded successfully' };
            }
            catch (error) {
                fastify.log.error('Error recording AI feedback:', error);
                return reply.code(500).send({
                    error: 'Failed to record feedback',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    });
    fastify.get('/learning-insights', {
        schema: {
            description: 'Get AI learning insights and improvement suggestions',
            tags: ['ai-scheduling']
        },
        handler: async (request, reply) => {
            try {
                fastify.log.info('AI Learning Insights Request');
                const insights = await aiService.getLearningInsights();
                return { insights };
            }
            catch (error) {
                fastify.log.error('Error getting AI learning insights:', error);
                return reply.code(500).send({
                    error: 'Failed to get learning insights',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    });
}
function generateInsights(analysis, existingTasks) {
    const insights = {
        recommendations: [],
        warnings: [],
        optimizations: []
    };
    if (analysis.complexity === 'high') {
        insights.recommendations.push('Consider breaking this project into smaller phases to reduce complexity');
        insights.recommendations.push('Allocate experienced team members to high-complexity tasks');
    }
    if (analysis.riskLevel > 60) {
        insights.warnings.push('High risk level detected - consider adding buffer time and contingency plans');
        insights.recommendations.push('Implement regular risk assessment checkpoints');
    }
    if (analysis.resourceRequirements.developers > 5) {
        insights.recommendations.push('Large development team required - ensure proper coordination and communication');
    }
    if (analysis.resourceRequirements.designers === 0 && analysis.projectType.includes('app')) {
        insights.warnings.push('No designers allocated for app project - consider adding UI/UX design resources');
    }
    if (analysis.estimatedDuration > 60) {
        insights.optimizations.push('Long project duration - consider parallel task execution where possible');
        insights.recommendations.push('Break project into smaller milestones for better tracking');
    }
    const highRiskTasks = analysis.taskSuggestions.filter((task) => task.riskLevel > 50);
    if (highRiskTasks.length > 0) {
        insights.warnings.push(`${highRiskTasks.length} high-risk tasks identified - monitor closely`);
    }
    const highComplexityTasks = analysis.taskSuggestions.filter((task) => task.complexity === 'high');
    if (highComplexityTasks.length > analysis.taskSuggestions.length * 0.6) {
        insights.recommendations.push('Most tasks are high complexity - consider additional planning and review cycles');
    }
    return insights;
}
function generateDependencySuggestions(tasks, projectContext) {
    const dependencies = [];
    const planningTasks = tasks.filter(task => task.category?.toLowerCase().includes('planning') ||
        task.name.toLowerCase().includes('requirements'));
    const designTasks = tasks.filter(task => task.category?.toLowerCase().includes('design') ||
        task.name.toLowerCase().includes('design') ||
        task.name.toLowerCase().includes('ui'));
    const developmentTasks = tasks.filter(task => task.category?.toLowerCase().includes('development') ||
        task.name.toLowerCase().includes('development') ||
        task.name.toLowerCase().includes('coding'));
    const testingTasks = tasks.filter(task => task.category?.toLowerCase().includes('testing') ||
        task.name.toLowerCase().includes('testing') ||
        task.name.toLowerCase().includes('qa'));
    planningTasks.forEach(planningTask => {
        designTasks.forEach(designTask => {
            dependencies.push({
                fromTask: planningTask.id,
                toTask: designTask.id,
                type: 'finish-to-start',
                confidence: 0.9,
                reason: 'Design tasks typically depend on completed requirements and planning'
            });
        });
    });
    designTasks.forEach(designTask => {
        developmentTasks.forEach(devTask => {
            dependencies.push({
                fromTask: designTask.id,
                toTask: devTask.id,
                type: 'finish-to-start',
                confidence: 0.8,
                reason: 'Development tasks typically require completed designs'
            });
        });
    });
    developmentTasks.forEach(devTask => {
        testingTasks.forEach(testTask => {
            dependencies.push({
                fromTask: devTask.id,
                toTask: testTask.id,
                type: 'finish-to-start',
                confidence: 0.95,
                reason: 'Testing tasks require completed development work'
            });
        });
    });
    return dependencies;
}
async function optimizeSchedule(scheduleId, optimizationGoals, constraints, fastify) {
    return {
        tasks: [],
        improvements: {
            durationReduction: 0,
            riskReduction: 0,
            resourceUtilization: 0
        }
    };
}
async function generateProjectInsights(projectId, fastify) {
    return {
        performanceMetrics: {},
        riskIndicators: [],
        recommendations: [],
        trends: {}
    };
}
//# sourceMappingURL=aiScheduling.js.map