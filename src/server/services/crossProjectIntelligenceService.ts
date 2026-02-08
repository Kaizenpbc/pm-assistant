import { FastifyInstance } from 'fastify';
import { AIContextBuilder } from './aiContextBuilder';
import { claudeService, PromptTemplate } from './claudeService';
import { logAIUsage } from './aiUsageLogger';
import { computeEVMMetrics } from './predictiveIntelligence';
import type { AICrossProjectInsight } from '../schemas/phase5Schemas';

// ---------------------------------------------------------------------------
// Prompt Template
// ---------------------------------------------------------------------------

const crossProjectPrompt = new PromptTemplate(
  `You are a portfolio intelligence analyst for Guyana's Ministry of Works. Analyze cross-project data and provide strategic insights.

Portfolio context:
{{portfolioContext}}

Resource conflicts:
{{resourceConflicts}}

Budget reallocation candidates:
{{budgetData}}

Similar project data:
{{similarProjects}}

Return a JSON object with:
- "summary": 1-2 sentence strategic overview
- "recommendations": array of budget reallocation suggestions
- "similarProjectInsights": enhanced with "lessonsLearned" field for each similar project

Keep recommendations specific and actionable for Guyana's infrastructure context.`,
  '1.0.0',
);

// ---------------------------------------------------------------------------
// CrossProjectIntelligenceService
// ---------------------------------------------------------------------------

export class CrossProjectIntelligenceService {
  private contextBuilder: AIContextBuilder;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.contextBuilder = new AIContextBuilder(fastify);
  }

  // -----------------------------------------------------------------------
  // Full portfolio analysis
  // -----------------------------------------------------------------------

  async analyzePortfolio(
    regionId?: string,
    userId?: string,
  ): Promise<{ insight: AICrossProjectInsight; aiPowered: boolean }> {
    const portfolio = await this.contextBuilder.buildPortfolioContext(regionId);
    const resources = await this.contextBuilder.buildCrossProjectResourceContext(regionId);
    const db = (this.fastify as any).mysql || (this.fastify as any).db;

    // 1. Resource conflicts
    const resourceConflicts = resources.map(r => {
      let severity: 'low' | 'medium' | 'high' | 'critical';
      if (r.activeTasks > 15) severity = 'critical';
      else if (r.activeTasks > 10) severity = 'high';
      else if (r.activeTasks > 6) severity = 'medium';
      else severity = 'low';

      return {
        userId: r.userId,
        userName: r.userName,
        activeTasks: r.activeTasks,
        projectCount: r.projectCount,
        projects: r.projects,
        severity,
        recommendation: severity === 'critical' || severity === 'high'
          ? `Reassign some tasks from ${r.userName} who has ${r.activeTasks} active tasks across ${r.projectCount} projects.`
          : `Monitor ${r.userName}'s workload (${r.activeTasks} tasks across ${r.projectCount} projects).`,
      };
    });

    // 2. Portfolio risk heat map
    const portfolioRiskHeatMap = portfolio.projectSummaries.map(p => {
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      const healthScore = Math.round(
        Math.min(p.progress, 100) * 0.4 +
        (p.budgetUtilization <= 100 ? 100 - p.budgetUtilization * 0.5 : Math.max(0, 100 - p.budgetUtilization)) * 0.3 +
        (p.healthIndicator === 'good' ? 85 : p.healthIndicator === 'warning' ? 55 : 25) * 0.3
      );

      if (healthScore >= 75) riskLevel = 'low';
      else if (healthScore >= 50) riskLevel = 'medium';
      else if (healthScore >= 25) riskLevel = 'high';
      else riskLevel = 'critical';

      return {
        projectId: p.id,
        projectName: p.name,
        healthScore,
        riskLevel,
        budgetUtilization: p.budgetUtilization,
        progress: p.progress,
      };
    });

    // 3. Budget reallocation analysis
    const surplusCandidates: AICrossProjectInsight['budgetReallocation']['surplusCandidates'] = [];
    const deficitCandidates: AICrossProjectInsight['budgetReallocation']['deficitCandidates'] = [];

    for (const p of portfolio.projectSummaries) {
      if (p.status !== 'active') continue;

      try {
        const ctx = await this.contextBuilder.buildProjectContext(p.id);
        const totalDays = ctx.metrics.daysElapsed + ctx.metrics.daysRemaining;
        const evm = computeEVMMetrics(
          ctx.project.budgetAllocated,
          ctx.project.budgetSpent,
          ctx.metrics.completionRate,
          ctx.metrics.daysElapsed,
          totalDays,
        );

        if (evm.cpi > 1.1 && evm.spi > 1.1) {
          surplusCandidates.push({
            projectId: p.id,
            projectName: p.name,
            cpi: evm.cpi,
            spi: evm.spi,
            estimatedSurplus: Math.max(0, evm.vac),
          });
        } else if (evm.cpi < 0.9 || (ctx.metrics.budgetUtilization > 90 && ctx.metrics.completionRate < 70)) {
          deficitCandidates.push({
            projectId: p.id,
            projectName: p.name,
            cpi: evm.cpi,
            spi: evm.spi,
            estimatedDeficit: Math.abs(Math.min(0, evm.vac)),
          });
        }
      } catch {
        // Skip projects with insufficient data
      }
    }

    const budgetRecommendations: string[] = [];
    if (surplusCandidates.length > 0 && deficitCandidates.length > 0) {
      budgetRecommendations.push(
        `Consider reallocating funds from surplus projects (${surplusCandidates.map(s => s.projectName).join(', ')}) to deficit projects (${deficitCandidates.map(d => d.projectName).join(', ')}).`
      );
    }
    if (deficitCandidates.length > 0) {
      budgetRecommendations.push(`${deficitCandidates.length} project(s) may need supplementary funding.`);
    }
    if (budgetRecommendations.length === 0) {
      budgetRecommendations.push('Budget allocation across the portfolio appears balanced.');
    }

    // 4. Similar projects (empty for portfolio-wide, use findSimilarProjects for per-project)
    const similarProjectInsights: AICrossProjectInsight['similarProjectInsights'] = [];

    const deterministicInsight: AICrossProjectInsight = {
      resourceConflicts,
      portfolioRiskHeatMap,
      budgetReallocation: {
        surplusCandidates,
        deficitCandidates,
        recommendations: budgetRecommendations,
      },
      similarProjectInsights,
      summary: `Portfolio has ${portfolio.totalProjects} projects. ${resourceConflicts.filter(r => r.severity === 'high' || r.severity === 'critical').length} resource conflict(s) and ${deficitCandidates.length} budget deficit(s) detected.`,
    };

    if (!claudeService.isAvailable()) {
      return { insight: deterministicInsight, aiPowered: false };
    }

    // Claude enhancement
    try {
      const portfolioPrompt = this.contextBuilder.portfolioToPromptString(portfolio);
      const resourceStr = this.contextBuilder.crossProjectToPromptString(resources);

      const systemPrompt = crossProjectPrompt.render({
        portfolioContext: portfolioPrompt,
        resourceConflicts: resourceStr,
        budgetData: JSON.stringify({ surplusCandidates, deficitCandidates }, null, 2),
        similarProjects: 'N/A for portfolio-wide analysis',
      });

      const result = await claudeService.complete({
        systemPrompt,
        userMessage: 'Analyze the cross-project data and return the enhanced JSON.',
        responseFormat: 'json',
        temperature: 0.3,
      });

      logAIUsage(this.fastify, {
        userId,
        feature: 'cross_project_intelligence',
        model: 'claude',
        usage: result.usage,
        latencyMs: result.latencyMs,
        success: true,
        requestContext: { regionId },
      });

      const parsed = JSON.parse(result.content);
      return {
        insight: {
          ...deterministicInsight,
          summary: parsed.summary || deterministicInsight.summary,
          budgetReallocation: {
            ...deterministicInsight.budgetReallocation,
            recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : budgetRecommendations,
          },
        },
        aiPowered: true,
      };
    } catch (err) {
      this.fastify.log.warn({ err }, 'AI cross-project analysis failed, using deterministic results');
      return { insight: deterministicInsight, aiPowered: false };
    }
  }

  // -----------------------------------------------------------------------
  // Find similar completed projects
  // -----------------------------------------------------------------------

  async findSimilarProjects(
    projectId: string,
    userId?: string,
  ): Promise<{ similar: AICrossProjectInsight['similarProjectInsights']; aiPowered: boolean }> {
    const db = (this.fastify as any).mysql || (this.fastify as any).db;
    if (!db) return { similar: [], aiPowered: false };

    const context = await this.contextBuilder.buildProjectContext(projectId);
    const { project } = context;

    // Find completed projects with same category and similar budget (within 50%)
    const budgetLow = project.budgetAllocated * 0.5;
    const budgetHigh = project.budgetAllocated * 1.5;

    const [rows]: any = await db.query(
      `SELECT p.id, p.name, p.category, p.budget_allocated, p.budget_spent, p.status,
              p.start_date, p.end_date
       FROM projects p
       WHERE p.id != ?
         AND p.status = 'completed'
         AND (p.category = ? OR (p.budget_allocated BETWEEN ? AND ?))
       ORDER BY p.end_date DESC
       LIMIT 5`,
      [projectId, project.category || '', budgetLow, budgetHigh],
    );

    const similar = rows.map((r: any) => {
      const startDate = new Date(r.start_date);
      const endDate = new Date(r.end_date);
      const durationDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));

      return {
        projectId: r.id,
        projectName: r.name,
        category: r.category || 'Uncategorized',
        budgetAllocated: parseFloat(r.budget_allocated) || 0,
        finalBudget: parseFloat(r.budget_spent) || 0,
        durationDays,
        status: r.status,
        lessonsLearned: parseFloat(r.budget_spent) > parseFloat(r.budget_allocated)
          ? `This project went ${((parseFloat(r.budget_spent) / parseFloat(r.budget_allocated) - 1) * 100).toFixed(0)}% over budget. Plan for contingencies.`
          : `Completed within budget. Duration was ${durationDays} days.`,
      };
    });

    return { similar, aiPowered: false };
  }
}
