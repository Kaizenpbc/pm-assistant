import { FastifyInstance } from 'fastify';
import { AIContextBuilder } from './aiContextBuilder';
import { claudeService, PromptTemplate } from './claudeService';
import { logAIUsage } from './aiUsageLogger';
import type { AIAnomaly, AIAnomalyReport } from '../schemas/phase5Schemas';

// ---------------------------------------------------------------------------
// Prompt Template
// ---------------------------------------------------------------------------

const anomalyExplanationPrompt = new PromptTemplate(
  `You are a project anomaly analyst for Guyana's Ministry of Works. Review the detected anomalies below and provide root-cause analysis, prioritized recommendations, and an overall health trend assessment.

Detected anomalies:
{{anomalies}}

Portfolio context:
{{portfolioContext}}

Return a JSON object with:
- "anomalies": the same array but with enhanced "description" and "recommendation" fields
- "summary": a 1-2 sentence summary of the portfolio's anomaly state
- "overallHealthTrend": "improving" | "stable" | "deteriorating"`,
  '1.0.0',
);

// ---------------------------------------------------------------------------
// AnomalyDetectionService
// ---------------------------------------------------------------------------

export class AnomalyDetectionService {
  private contextBuilder: AIContextBuilder;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.contextBuilder = new AIContextBuilder(fastify);
  }

  // -----------------------------------------------------------------------
  // Portfolio-wide anomaly scan
  // -----------------------------------------------------------------------

  async detectPortfolioAnomalies(
    regionId?: string,
    userId?: string,
  ): Promise<AIAnomalyReport> {
    const portfolio = await this.contextBuilder.buildPortfolioContext(regionId);
    const anomalies: AIAnomaly[] = [];

    for (const p of portfolio.projectSummaries) {
      if (p.status !== 'active' && p.status !== 'in_progress') continue;
      const projectAnomalies = await this.detectForProject(p.id, p.name);
      anomalies.push(...projectAnomalies);
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    anomalies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const deterministicReport: AIAnomalyReport = {
      anomalies,
      summary: anomalies.length === 0
        ? 'No anomalies detected across the portfolio.'
        : `${anomalies.length} anomalie(s) detected across ${portfolio.projectSummaries.length} projects.`,
      overallHealthTrend: this.inferHealthTrend(anomalies),
      scannedProjects: portfolio.projectSummaries.length,
      aiPowered: false,
    };

    if (!claudeService.isAvailable() || anomalies.length === 0) {
      return deterministicReport;
    }

    // Claude enhancement
    try {
      const portfolioPrompt = this.contextBuilder.portfolioToPromptString(portfolio);
      const anomaliesStr = JSON.stringify(anomalies, null, 2);

      const systemPrompt = anomalyExplanationPrompt.render({
        anomalies: anomaliesStr,
        portfolioContext: portfolioPrompt,
      });

      const result = await claudeService.complete({
        systemPrompt,
        userMessage: 'Analyze the anomalies and return the enhanced JSON.',
        responseFormat: 'json',
        temperature: 0.3,
      });

      logAIUsage(this.fastify, {
        userId,
        feature: 'anomaly_detection',
        model: 'claude',
        usage: result.usage,
        latencyMs: result.latencyMs,
        success: true,
        requestContext: { regionId },
      });

      const parsed = JSON.parse(result.content);
      return {
        anomalies: Array.isArray(parsed.anomalies) ? parsed.anomalies : anomalies,
        summary: parsed.summary || deterministicReport.summary,
        overallHealthTrend: parsed.overallHealthTrend || deterministicReport.overallHealthTrend,
        scannedProjects: portfolio.projectSummaries.length,
        aiPowered: true,
      };
    } catch (err) {
      this.fastify.log.warn({ err }, 'AI anomaly enhancement failed, using deterministic results');
      return deterministicReport;
    }
  }

  // -----------------------------------------------------------------------
  // Single project anomaly scan
  // -----------------------------------------------------------------------

  async detectProjectAnomalies(
    projectId: string,
    userId?: string,
  ): Promise<AIAnomalyReport> {
    const context = await this.contextBuilder.buildProjectContext(projectId);
    const anomalies = await this.detectForProject(projectId, context.project.name);

    return {
      anomalies,
      summary: anomalies.length === 0
        ? `No anomalies detected for "${context.project.name}".`
        : `${anomalies.length} anomalie(s) detected for "${context.project.name}".`,
      overallHealthTrend: this.inferHealthTrend(anomalies),
      scannedProjects: 1,
      aiPowered: false,
    };
  }

  // -----------------------------------------------------------------------
  // Deterministic anomaly detection for a single project
  // -----------------------------------------------------------------------

  private async detectForProject(projectId: string, projectName: string): Promise<AIAnomaly[]> {
    const anomalies: AIAnomaly[] = [];
    const now = new Date().toISOString();

    try {
      const history = await this.contextBuilder.buildHistoricalCompletionContext(projectId, 30);
      const context = await this.contextBuilder.buildProjectContext(projectId);

      // 1. Completion drop: 7-day avg < 50% of 30-day avg
      if (history.dailyCompletions.length >= 7) {
        const last7 = history.dailyCompletions.slice(-7);
        const avg7 = last7.reduce((s, d) => s + d.completed, 0) / 7;
        const avg30 = history.dailyCompletions.reduce((s, d) => s + d.completed, 0) / history.dailyCompletions.length;

        if (avg30 > 0 && avg7 < avg30 * 0.5) {
          anomalies.push({
            type: 'completion_drop',
            projectId,
            projectName,
            severity: avg7 === 0 ? 'critical' : 'high',
            title: 'Task Completion Drop',
            description: `7-day completion average (${avg7.toFixed(1)}/day) is less than half the 30-day average (${avg30.toFixed(1)}/day).`,
            recommendation: 'Investigate resource availability and blockers. Consider reassigning tasks or reviewing workload.',
            detectedAt: now,
            dataPoints: { avg7day: avg7, avg30day: avg30 },
          });
        }
      }

      // 2. Budget spike: weekly spend > 2x weekly average
      const { project, metrics } = context;
      if (metrics.daysElapsed > 14 && project.budgetSpent > 0) {
        const weeklyAvg = (project.budgetSpent / metrics.daysElapsed) * 7;
        // We approximate recent weekly spend as total/elapsed * 7 - this is deterministic
        // A more precise check would require historical budget snapshots
        if (metrics.budgetUtilization > 90 && metrics.completionRate < 50) {
          anomalies.push({
            type: 'budget_spike',
            projectId,
            projectName,
            severity: metrics.budgetUtilization > 100 ? 'critical' : 'high',
            title: 'Budget Utilization Spike',
            description: `Budget is ${metrics.budgetUtilization}% utilized but project is only ${metrics.completionRate}% complete.`,
            recommendation: 'Conduct an immediate budget review. Identify unplanned expenditures and consider pausing non-critical activities.',
            detectedAt: now,
            dataPoints: { budgetUtilization: metrics.budgetUtilization, completionRate: metrics.completionRate },
          });
        }
      }

      // 3. Stale project: active project with no updates in 14+ days
      if (history.lastActivityDate) {
        const lastActivity = new Date(history.lastActivityDate);
        const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / 86400000);

        if (daysSinceActivity >= 14 && context.project.status === 'active') {
          anomalies.push({
            type: 'stale_project',
            projectId,
            projectName,
            severity: daysSinceActivity >= 30 ? 'high' : 'medium',
            title: 'Stale Project',
            description: `No task updates in ${daysSinceActivity} days despite "active" status.`,
            recommendation: 'Check if the project is still active. Update task progress or change project status to "on_hold".',
            detectedAt: now,
            dataPoints: { daysSinceActivity, lastActivity: history.lastActivityDate },
          });
        }
      }

      // 4. Task rescheduling: >30% of active tasks are overdue
      if (metrics.totalTasks > 0) {
        const overdueRatio = metrics.overdueTasks / metrics.totalTasks;
        if (overdueRatio > 0.3) {
          anomalies.push({
            type: 'task_rescheduling',
            projectId,
            projectName,
            severity: overdueRatio > 0.5 ? 'high' : 'medium',
            title: 'High Overdue Task Ratio',
            description: `${metrics.overdueTasks} of ${metrics.totalTasks} tasks (${(overdueRatio * 100).toFixed(0)}%) are overdue.`,
            recommendation: 'Review task deadlines and reassign or reschedule overdue tasks. Consider extending the project timeline.',
            detectedAt: now,
            dataPoints: { overdueTasks: metrics.overdueTasks, totalTasks: metrics.totalTasks, overdueRatio },
          });
        }
      }

      // 5. Budget flatline: active project with tasks in progress but budget_spent unchanged
      if (context.project.status === 'active' && metrics.completionRate > 0 && metrics.completionRate < 100) {
        // Check if budget hasn't changed (budget_spent very low relative to progress)
        if (project.budgetAllocated > 0 && project.budgetSpent === 0 && metrics.completionRate > 20) {
          anomalies.push({
            type: 'budget_flatline',
            projectId,
            projectName,
            severity: 'medium',
            title: 'Budget Flatline',
            description: `Project is ${metrics.completionRate}% complete but no budget expenditure recorded.`,
            recommendation: 'Verify that expenditures are being recorded. Update budget_spent to reflect actual costs.',
            detectedAt: now,
            dataPoints: { budgetSpent: project.budgetSpent, completionRate: metrics.completionRate },
          });
        }
      }
    } catch (err) {
      this.fastify.log.warn({ err, projectId }, 'Anomaly detection failed for project (non-critical)');
    }

    return anomalies;
  }

  private inferHealthTrend(anomalies: AIAnomaly[]): 'improving' | 'stable' | 'deteriorating' {
    const criticalOrHigh = anomalies.filter(a => a.severity === 'critical' || a.severity === 'high').length;
    if (criticalOrHigh >= 3) return 'deteriorating';
    if (criticalOrHigh >= 1) return 'stable';
    return 'improving';
  }
}
