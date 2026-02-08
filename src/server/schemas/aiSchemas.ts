import { z } from 'zod';

// ---------------------------------------------------------------------------
// Task Breakdown / Project Analysis
// ---------------------------------------------------------------------------

const AITaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  estimatedDays: z.number().min(0.5),
  complexity: z.enum(['low', 'medium', 'high']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dependencies: z.array(z.string()),
  riskLevel: z.number().min(0).max(100),
  category: z.string(),
  skills: z.array(z.string()),
  deliverables: z.array(z.string()),
});

const AIPhaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  estimatedDays: z.number().min(0),
  tasks: z.array(AITaskSchema),
});

export const AIProjectAnalysisSchema = z.object({
  projectType: z.string(),
  complexity: z.enum(['low', 'medium', 'high']),
  estimatedDuration: z.number().min(1),
  riskLevel: z.number().min(0).max(100),
  suggestedPhases: z.array(AIPhaseSchema),
  taskSuggestions: z.array(AITaskSchema),
  criticalPath: z.array(z.string()),
  resourceRequirements: z.object({
    developers: z.number().min(0).optional().default(0),
    designers: z.number().min(0).optional().default(0),
    testers: z.number().min(0).optional().default(0),
    managers: z.number().min(0).optional().default(0),
  }),
  insights: z.object({
    recommendations: z.array(z.string()),
    warnings: z.array(z.string()),
    optimizations: z.array(z.string()),
  }).optional(),
});

export type AIProjectAnalysis = z.infer<typeof AIProjectAnalysisSchema>;

// ---------------------------------------------------------------------------
// Dependency Suggestions
// ---------------------------------------------------------------------------

export const AIDependencyResponseSchema = z.object({
  dependencies: z.array(
    z.object({
      fromTask: z.string(),
      toTask: z.string(),
      type: z.enum(['finish-to-start', 'start-to-start', 'finish-to-finish']),
      confidence: z.number().min(0).max(1),
      reason: z.string(),
    }),
  ),
});

export type AIDependencyResponse = z.infer<typeof AIDependencyResponseSchema>;

// ---------------------------------------------------------------------------
// Schedule Optimization
// ---------------------------------------------------------------------------

export const AIScheduleOptimizationSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      suggestedStartDate: z.string(),
      suggestedEndDate: z.string(),
      suggestedAssignee: z.string().optional(),
      optimizationReason: z.string(),
    }),
  ),
  improvements: z.object({
    durationReduction: z.number(),
    riskReduction: z.number(),
    resourceUtilization: z.number(),
  }),
  summary: z.string().optional(),
});

export type AIScheduleOptimization = z.infer<typeof AIScheduleOptimizationSchema>;

// ---------------------------------------------------------------------------
// Project Insights
// ---------------------------------------------------------------------------

export const AIProjectInsightsSchema = z.object({
  healthScore: z.number().min(0).max(100),
  healthTrend: z.enum(['improving', 'stable', 'deteriorating']),
  performanceMetrics: z.object({
    schedulePerformanceIndex: z.number().optional(),
    costPerformanceIndex: z.number().optional(),
    completionRate: z.number().optional(),
  }),
  riskIndicators: z.array(
    z.object({
      category: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      description: z.string(),
      recommendation: z.string(),
    }),
  ),
  recommendations: z.array(
    z.object({
      priority: z.enum(['low', 'medium', 'high', 'urgent']),
      category: z.string(),
      title: z.string(),
      description: z.string(),
      expectedImpact: z.string(),
    }),
  ),
  trends: z.object({
    schedule: z.enum(['ahead', 'on_track', 'behind', 'critical']),
    budget: z.enum(['under', 'on_track', 'over', 'critical']),
    quality: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  }),
});

export type AIProjectInsights = z.infer<typeof AIProjectInsightsSchema>;
