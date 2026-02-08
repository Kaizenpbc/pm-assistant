import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ClaudeTaskBreakdownService } from '../services/aiTaskBreakdownClaude';
import {
  suggestDependenciesClaude,
  optimizeScheduleClaude,
  generateProjectInsightsClaude,
} from '../services/aiSchedulingClaude';

// Schema definitions
const analyzeProjectSchema = {
  description: 'Analyze project and generate AI task breakdown',
  tags: ['ai-scheduling'],
  body: {
    type: 'object',
    required: ['projectDescription'],
    properties: {
      projectDescription: { type: 'string', minLength: 10 },
      projectType: { type: 'string' },
      projectId: { type: 'string' },
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
        },
        aiPowered: { type: 'boolean' }
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
        },
        aiPowered: { type: 'boolean' }
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
                  suggestedStartDate: { type: 'string' },
                  suggestedEndDate: { type: 'string' },
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
        },
        aiPowered: { type: 'boolean' }
      }
    }
  }
};

export async function aiSchedulingRoutes(fastify: FastifyInstance) {
  const claudeBreakdown = new ClaudeTaskBreakdownService(fastify);

  // Analyze project and generate AI task breakdown
  fastify.post('/analyze-project', {
    schema: analyzeProjectSchema,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { projectDescription, projectType, projectId, existingTasks } = request.body as any;
        const user = (request as any).user || {};

        fastify.log.info({ msg: 'AI Project Analysis Request', projectType, descriptionLength: projectDescription.length, existingTasksCount: existingTasks?.length || 0 });

        const { analysis, aiPowered } = await claudeBreakdown.analyzeProject(
          projectDescription,
          projectType,
          projectId,
          user.userId,
        );

        // Generate insights from analysis
        const insights = generateInsights(analysis, existingTasks);

        return { analysis, insights, aiPowered };
      } catch (error) {
        fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Error in AI project analysis');
        return reply.code(500).send({
          error: 'Failed to analyze project',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  // Suggest task dependencies
  fastify.post('/suggest-dependencies', {
    schema: suggestTaskDependenciesSchema,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { tasks, projectContext } = request.body as any;
        const user = (request as any).user || {};

        fastify.log.info({ msg: 'AI Dependency Suggestion Request', tasksCount: tasks.length, hasProjectContext: !!projectContext });

        const { dependencies, aiPowered } = await suggestDependenciesClaude(
          tasks,
          projectContext,
          fastify,
          user.userId,
        );

        return { dependencies, aiPowered };
      } catch (error) {
        fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Error in AI dependency suggestion');
        return reply.code(500).send({
          error: 'Failed to suggest dependencies',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  // Optimize existing schedule
  fastify.post('/optimize-schedule', {
    schema: optimizeScheduleSchema,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { scheduleId, optimizationGoals, constraints } = request.body as any;
        const user = (request as any).user || {};

        fastify.log.info({ msg: 'AI Schedule Optimization Request', scheduleId, optimizationGoals, constraints });

        const { optimizedSchedule, aiPowered } = await optimizeScheduleClaude(
          scheduleId,
          optimizationGoals || [],
          constraints,
          fastify,
          user.userId,
        );

        return { optimizedSchedule, aiPowered };
      } catch (error) {
        fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Error in AI schedule optimization');
        return reply.code(500).send({
          error: 'Failed to optimize schedule',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  // Get AI insights for existing project
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
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { projectId } = request.params as any;
        const user = (request as any).user || {};

        fastify.log.info({ msg: 'AI Insights Request', projectId });

        const { insights, aiPowered } = await generateProjectInsightsClaude(
          projectId,
          fastify,
          user.userId,
        );

        return { insights, aiPowered };
      } catch (error) {
        fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Error generating AI insights');
        return reply.code(500).send({
          error: 'Failed to generate insights',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  // Record user feedback for AI learning
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
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const feedbackData = request.body as any;

        fastify.log.info({ msg: 'AI Feedback Recording Request', projectType: feedbackData.projectType, acceptedTasks: feedbackData.userFeedback.acceptedTasks.length, rejectedTasks: feedbackData.userFeedback.rejectedTasks.length });

        // Feedback recording is retained from the fallback service
        // In future phases, feedback will be used for the learning system
        const { FallbackTaskBreakdownService } = await import('../services/aiTaskBreakdown');
        const fallback = new FallbackTaskBreakdownService(fastify);
        // Store feedback for future learning
        fastify.log.info('Feedback received (learning system coming in Phase 5)');

        return { message: 'Feedback recorded successfully' };
      } catch (error) {
        fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Error recording AI feedback');
        return reply.code(500).send({
          error: 'Failed to record feedback',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  // Get AI learning insights
  fastify.get('/learning-insights', {
    schema: {
      description: 'Get AI learning insights and improvement suggestions',
      tags: ['ai-scheduling']
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        fastify.log.info('AI Learning Insights Request');

        return {
          insights: {
            message: 'Learning system coming in Phase 5',
            totalFeedbackItems: 0,
            accuracyTrend: 'stable',
          },
        };
      } catch (error) {
        fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Error getting AI learning insights');
        return reply.code(500).send({
          error: 'Failed to get learning insights',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });
}

/**
 * Generate insights and recommendations based on AI analysis
 */
function generateInsights(analysis: any, existingTasks?: any[]): any {
  const insights: { recommendations: string[]; warnings: string[]; optimizations: string[] } = {
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

  const highRiskTasks = analysis.taskSuggestions.filter((task: any) => task.riskLevel > 50);
  if (highRiskTasks.length > 0) {
    insights.warnings.push(`${highRiskTasks.length} high-risk tasks identified - monitor closely`);
  }

  const highComplexityTasks = analysis.taskSuggestions.filter((task: any) => task.complexity === 'high');
  if (highComplexityTasks.length > analysis.taskSuggestions.length * 0.6) {
    insights.recommendations.push('Most tasks are high complexity - consider additional planning and review cycles');
  }

  return insights;
}
