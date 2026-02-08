import { FastifyInstance } from 'fastify';
import { AIContextBuilder, ProjectContext, ProjectMetrics } from './aiContextBuilder';
import { claudeService, PromptTemplate } from './claudeService';
import { dataProviderManager } from './dataProviders';
import { logAIUsage } from './aiUsageLogger';
import { AILearningServiceV2 } from './aiLearningService';
import {
  AIRiskAssessmentSchema,
  AIWeatherImpactSchema,
  AIBudgetForecastSchema,
  AIDashboardPredictionsSchema,
  type AIRiskAssessment,
  type AIWeatherImpact,
  type AIBudgetForecast,
  type AIDashboardPredictions,
} from '../schemas/predictiveSchemas';
import type { WeatherForecast } from './dataProviders';

// ---------------------------------------------------------------------------
// Guyana Region Coordinates (10 administrative regions + Georgetown fallback)
// ---------------------------------------------------------------------------

const GUYANA_REGION_COORDINATES: Record<string, { lat: number; lon: number }> = {
  'barima-waini':          { lat: 7.50, lon: -59.65 },
  'pomeroon-supenaam':     { lat: 7.15, lon: -58.70 },
  'essequibo islands-west demerara': { lat: 6.60, lon: -58.35 },
  'demerara-mahaica':      { lat: 6.75, lon: -58.10 },
  'mahaica-berbice':       { lat: 6.35, lon: -57.60 },
  'east berbice-corentyne': { lat: 5.95, lon: -57.50 },
  'cuyuni-mazaruni':       { lat: 6.00, lon: -60.20 },
  'potaro-siparuni':       { lat: 5.00, lon: -59.30 },
  'upper takutu-upper essequibo': { lat: 3.00, lon: -59.50 },
  'upper demerara-berbice': { lat: 5.80, lon: -58.20 },
  'georgetown':            { lat: 6.80, lon: -58.16 },
};

const DEFAULT_COORDINATES = GUYANA_REGION_COORDINATES['georgetown'];

// Outdoor-sensitive task category keywords
const OUTDOOR_KEYWORDS = [
  'construction', 'earthwork', 'excavation', 'grading', 'paving',
  'concrete', 'foundation', 'roofing', 'landscaping', 'drainage',
  'bridge', 'road', 'building', 'installation', 'site preparation',
  'demolition', 'clearing', 'survey', 'inspection',
];

// ---------------------------------------------------------------------------
// Prompt Templates
// ---------------------------------------------------------------------------

const riskPredictionPrompt = new PromptTemplate(
  `You are a risk prediction engine for government infrastructure projects in Guyana. Analyze the project data and produce a comprehensive risk assessment.

Consider all risk dimensions: schedule, budget, resource, weather, regulatory, technical, and stakeholder risks.

For each risk:
- Score probability (1-5) and impact (1-5)
- Assign severity: low (score 1-5), medium (6-10), high (11-15), critical (16-25) where score = probability * impact
- List concrete mitigations

Project data:
{{projectData}}

Weather summary:
{{weatherSummary}}

Return a JSON object matching the schema. Be specific to this project's context — avoid generic advice.`,
  '1.0.0',
);

const weatherImpactPrompt = new PromptTemplate(
  `You are a weather impact analyst for construction and infrastructure projects in Guyana. Analyze the weather forecast against the project's outdoor tasks.

Project data:
{{projectData}}

Weather forecast (next 7 days):
{{weatherForecast}}

Outdoor-sensitive tasks:
{{outdoorTasks}}

Assess which tasks will be affected by weather, estimate delay days, and provide recommendations. Return a JSON object matching the schema.`,
  '1.0.0',
);

const budgetForecastPrompt = new PromptTemplate(
  `You are a budget and earned value management analyst for government infrastructure projects in Guyana. Interpret the EVM metrics and project context to provide actionable budget insights.

Project data:
{{projectData}}

EVM metrics:
{{evmMetrics}}

Provide budget recommendations, overrun probability assessment, and a clear summary. Return a JSON object matching the schema.`,
  '1.0.0',
);

const dashboardBriefingPrompt = new PromptTemplate(
  `You are a portfolio intelligence analyst for Guyana's Ministry of Works. Generate a concise daily briefing for the project manager.

Portfolio data:
{{portfolioData}}

Weather overview:
{{weatherOverview}}

Return a JSON object with:
- risks: count of critical/high/medium/low risks across the portfolio
- weather: current condition and impact summary
- budget: projects over budget vs on track, average CPI
- summary: 1-2 sentence daily briefing
- highlights: array of key items (text + type: risk/success/info)
- projectHealthScores: array of {projectId, healthScore (0-100), riskLevel}

Be concise and actionable.`,
  '1.0.0',
);

// ---------------------------------------------------------------------------
// Pure Utility Functions (exported for testing)
// ---------------------------------------------------------------------------

export function computeDeterministicRiskScore(
  metrics: ProjectMetrics,
  budgetUtilization: number,
): { score: number; severity: 'low' | 'medium' | 'high' | 'critical'; healthScore: number } {
  let score = 0;

  // Schedule risk: behind schedule increases risk
  if (metrics.scheduleVariance < -20) score += 30;
  else if (metrics.scheduleVariance < -10) score += 20;
  else if (metrics.scheduleVariance < 0) score += 10;

  // Budget risk: over-utilization
  if (budgetUtilization > 100) score += 30;
  else if (budgetUtilization > 90) score += 20;
  else if (budgetUtilization > 75) score += 10;

  // Overdue task ratio
  const overdueRatio = metrics.totalTasks > 0 ? metrics.overdueTasks / metrics.totalTasks : 0;
  if (overdueRatio > 0.3) score += 25;
  else if (overdueRatio > 0.15) score += 15;
  else if (overdueRatio > 0) score += 5;

  // Low completion with time running out
  if (metrics.daysRemaining < 30 && metrics.completionRate < 50) score += 15;

  score = Math.min(score, 100);
  const healthScore = Math.max(0, 100 - score);

  let severity: 'low' | 'medium' | 'high' | 'critical';
  if (score >= 70) severity = 'critical';
  else if (score >= 45) severity = 'high';
  else if (score >= 20) severity = 'medium';
  else severity = 'low';

  return { score, severity, healthScore };
}

export function computeEVMMetrics(
  budgetAllocated: number,
  budgetSpent: number,
  completionRate: number,
  daysElapsed: number,
  totalDays: number,
): {
  cpi: number;
  spi: number;
  eac: number;
  etc: number;
  vac: number;
  burnRateDaily: number;
  burnRateMonthly: number;
} {
  const percentElapsed = totalDays > 0 ? Math.min(daysElapsed / totalDays, 1) : 0;
  const plannedValue = budgetAllocated * percentElapsed;
  const earnedValue = budgetAllocated * (completionRate / 100);
  const actualCost = budgetSpent;

  const cpi = actualCost > 0 ? parseFloat((earnedValue / actualCost).toFixed(2)) : 1;
  const spi = plannedValue > 0 ? parseFloat((earnedValue / plannedValue).toFixed(2)) : 1;

  const eac = cpi > 0 ? parseFloat((budgetAllocated / cpi).toFixed(2)) : budgetAllocated;
  const etc = Math.max(0, parseFloat((eac - actualCost).toFixed(2)));
  const vac = parseFloat((budgetAllocated - eac).toFixed(2));

  const burnRateDaily = daysElapsed > 0 ? parseFloat((actualCost / daysElapsed).toFixed(2)) : 0;
  const burnRateMonthly = parseFloat((burnRateDaily * 30).toFixed(2));

  return { cpi, spi, eac, etc, vac, burnRateDaily, burnRateMonthly };
}

export function lookupRegionCoordinates(regionName: string): { lat: number; lon: number } {
  if (!regionName) return DEFAULT_COORDINATES;
  const key = regionName.toLowerCase().trim();
  // Try exact match first, then partial match
  if (GUYANA_REGION_COORDINATES[key]) return GUYANA_REGION_COORDINATES[key];
  for (const [name, coords] of Object.entries(GUYANA_REGION_COORDINATES)) {
    if (key.includes(name) || name.includes(key)) return coords;
  }
  return DEFAULT_COORDINATES;
}

export function categorizeWeatherImpact(
  conditionCode: string,
  precipMm: number,
  windKph: number,
): 'none' | 'low' | 'moderate' | 'high' | 'severe' {
  const code = conditionCode.toLowerCase();
  const isStorm = code.includes('thunder') || code.includes('storm');
  const isHeavyRain = code.includes('heavy') && code.includes('rain');

  if (isStorm || precipMm > 50 || windKph > 80) return 'severe';
  if (isHeavyRain || precipMm > 20 || windKph > 50) return 'high';
  if (precipMm > 10 || windKph > 30 || code.includes('rain')) return 'moderate';
  if (precipMm > 2 || code.includes('drizzle') || code.includes('overcast')) return 'low';
  return 'none';
}

function isOutdoorTask(taskName: string, category?: string): boolean {
  const text = `${taskName} ${category || ''}`.toLowerCase();
  return OUTDOOR_KEYWORDS.some((kw) => text.includes(kw));
}

// ---------------------------------------------------------------------------
// PredictiveIntelligenceService
// ---------------------------------------------------------------------------

export class PredictiveIntelligenceService {
  private contextBuilder: AIContextBuilder;
  private fastify: FastifyInstance;
  private learningService: AILearningServiceV2;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.contextBuilder = new AIContextBuilder(fastify);
    this.learningService = new AILearningServiceV2(fastify);
  }

  // -----------------------------------------------------------------------
  // 1. Risk Assessment
  // -----------------------------------------------------------------------

  async assessProjectRisks(
    projectId: string,
    userId?: string,
  ): Promise<{ assessment: AIRiskAssessment; aiPowered: boolean }> {
    const context = await this.contextBuilder.buildProjectContext(projectId);
    const { score, severity, healthScore } = computeDeterministicRiskScore(
      context.metrics,
      context.metrics.budgetUtilization,
    );

    if (!claudeService.isAvailable()) {
      return {
        assessment: this.buildFallbackRiskAssessment(context, score, severity, healthScore),
        aiPowered: false,
      };
    }

    try {
      let projectPrompt = this.contextBuilder.toPromptString(context);
      // Inject learning context
      const learningCtx = await this.learningService.buildLearningContext(context.project.category);
      if (learningCtx) projectPrompt += learningCtx;

      let weatherSummary = 'Weather data unavailable';
      try {
        const coords = lookupRegionCoordinates(context.project.region);
        const weather = await dataProviderManager.getWeather(coords.lat, coords.lon, 7);
        weatherSummary = `Current: ${weather.current.condition}, ${weather.current.temperature}°C, precipitation: ${weather.current.precipitation}mm, wind: ${weather.current.windSpeed}km/h`;
      } catch { /* weather fetch failure is non-critical */ }

      const systemPrompt = riskPredictionPrompt.render({
        projectData: projectPrompt,
        weatherSummary,
      });

      const result = await claudeService.completeWithJsonSchema({
        systemPrompt,
        userMessage: 'Analyze this project and return the risk assessment JSON.',
        schema: AIRiskAssessmentSchema,
        temperature: 0.3,
      });

      logAIUsage(this.fastify, {
        userId,
        feature: 'risk_assessment',
        model: 'claude',
        usage: result.usage,
        latencyMs: result.latencyMs,
        success: true,
        requestContext: { projectId },
      });

      this.storeRiskAssessment(projectId, result.data);

      return { assessment: result.data, aiPowered: true };
    } catch (err) {
      this.fastify.log.warn({ err }, 'AI risk assessment failed, using fallback');
      logAIUsage(this.fastify, {
        userId,
        feature: 'risk_assessment',
        model: 'claude',
        usage: { inputTokens: 0, outputTokens: 0 },
        latencyMs: 0,
        success: false,
        errorMessage: err instanceof Error ? err.message : String(err),
        requestContext: { projectId },
      });
      return {
        assessment: this.buildFallbackRiskAssessment(context, score, severity, healthScore),
        aiPowered: false,
      };
    }
  }

  // -----------------------------------------------------------------------
  // 2. Weather Impact Analysis
  // -----------------------------------------------------------------------

  async analyzeWeatherImpact(
    projectId: string,
    userId?: string,
  ): Promise<{ impact: AIWeatherImpact; aiPowered: boolean }> {
    const context = await this.contextBuilder.buildProjectContext(projectId);
    const coords = lookupRegionCoordinates(context.project.region);

    let weather: WeatherForecast;
    try {
      weather = await dataProviderManager.getWeather(coords.lat, coords.lon, 7);
    } catch {
      return { impact: this.buildNoWeatherImpact(), aiPowered: false };
    }

    const outdoorTasks = context.tasks.filter((t) =>
      isOutdoorTask(t.name) && t.status !== 'completed',
    );

    if (!claudeService.isAvailable()) {
      return {
        impact: this.buildFallbackWeatherImpact(weather, outdoorTasks),
        aiPowered: false,
      };
    }

    try {
      const projectPrompt = this.contextBuilder.toPromptString(context);
      const forecastStr = weather.daily
        .map((d) => `${d.date}: ${d.condition}, precip ${d.precipitationAmount}mm (${d.precipitationChance}% chance), wind ${d.windSpeed}km/h`)
        .join('\n');
      const outdoorStr = outdoorTasks.length > 0
        ? outdoorTasks.map((t) => `- ${t.name} (${t.status}, ${t.progress}% done)`).join('\n')
        : 'No outdoor-sensitive tasks identified';

      const systemPrompt = weatherImpactPrompt.render({
        projectData: projectPrompt,
        weatherForecast: forecastStr,
        outdoorTasks: outdoorStr,
      });

      const result = await claudeService.completeWithJsonSchema({
        systemPrompt,
        userMessage: 'Analyze the weather impact on this project and return the JSON assessment.',
        schema: AIWeatherImpactSchema,
        temperature: 0.3,
      });

      logAIUsage(this.fastify, {
        userId,
        feature: 'weather_impact',
        model: 'claude',
        usage: result.usage,
        latencyMs: result.latencyMs,
        success: true,
        requestContext: { projectId },
      });

      return { impact: result.data, aiPowered: true };
    } catch (err) {
      this.fastify.log.warn({ err }, 'AI weather impact failed, using fallback');
      return {
        impact: this.buildFallbackWeatherImpact(weather, outdoorTasks),
        aiPowered: false,
      };
    }
  }

  // -----------------------------------------------------------------------
  // 3. Budget Forecast
  // -----------------------------------------------------------------------

  async forecastBudget(
    projectId: string,
    userId?: string,
  ): Promise<{ forecast: AIBudgetForecast; aiPowered: boolean }> {
    const context = await this.contextBuilder.buildProjectContext(projectId);
    const { project, metrics } = context;

    const totalDays = metrics.daysElapsed + metrics.daysRemaining;
    const evm = computeEVMMetrics(
      project.budgetAllocated,
      project.budgetSpent,
      metrics.completionRate,
      metrics.daysElapsed,
      totalDays,
    );

    const overrunProbability = evm.cpi < 0.8 ? 85
      : evm.cpi < 0.9 ? 65
      : evm.cpi < 1.0 ? 40
      : evm.cpi < 1.1 ? 20
      : 10;

    const fallbackForecast: AIBudgetForecast = {
      ...evm,
      overrunProbability,
      projectedCompletionBudget: evm.eac,
      recommendations: this.buildBudgetRecommendations(evm),
      summary: this.buildBudgetSummary(evm, project.budgetAllocated),
    };

    if (!claudeService.isAvailable()) {
      return { forecast: fallbackForecast, aiPowered: false };
    }

    try {
      let projectPrompt = this.contextBuilder.toPromptString(context);
      // Inject learning context
      const learningCtx = await this.learningService.buildLearningContext(context.project.category);
      if (learningCtx) projectPrompt += learningCtx;

      const evmStr = Object.entries(evm)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');

      const systemPrompt = budgetForecastPrompt.render({
        projectData: projectPrompt,
        evmMetrics: `Budget Allocated: $${project.budgetAllocated.toLocaleString()}\nBudget Spent: $${project.budgetSpent.toLocaleString()}\n${evmStr}`,
      });

      const result = await claudeService.completeWithJsonSchema({
        systemPrompt,
        userMessage: 'Analyze the budget and return the forecast JSON.',
        schema: AIBudgetForecastSchema,
        temperature: 0.3,
      });

      logAIUsage(this.fastify, {
        userId,
        feature: 'budget_forecast',
        model: 'claude',
        usage: result.usage,
        latencyMs: result.latencyMs,
        success: true,
        requestContext: { projectId },
      });

      return { forecast: result.data, aiPowered: true };
    } catch (err) {
      this.fastify.log.warn({ err }, 'AI budget forecast failed, using fallback');
      return { forecast: fallbackForecast, aiPowered: false };
    }
  }

  // -----------------------------------------------------------------------
  // 4. Dashboard Predictions
  // -----------------------------------------------------------------------

  async getDashboardPredictions(
    regionId?: string,
    userId?: string,
  ): Promise<{ predictions: AIDashboardPredictions; aiPowered: boolean }> {
    const portfolio = await this.contextBuilder.buildPortfolioContext(regionId);

    // Compute per-project health deterministically
    const projectHealthScores: Array<{ projectId: string; healthScore: number; riskLevel: 'low' | 'medium' | 'high' | 'critical' }> = [];
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    for (const p of portfolio.projectSummaries) {
      // Weighted health: 40% schedule (progress), 30% budget, 30% general health
      const scheduleHealth = Math.min(p.progress, 100);
      const budgetHealth = p.budgetUtilization <= 100 ? 100 - (p.budgetUtilization * 0.5) : Math.max(0, 100 - p.budgetUtilization);
      const generalHealth = p.healthIndicator === 'good' ? 85 : p.healthIndicator === 'warning' ? 55 : 25;
      const healthScore = Math.round(scheduleHealth * 0.4 + budgetHealth * 0.3 + generalHealth * 0.3);

      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      if (healthScore >= 75) { riskLevel = 'low'; lowCount++; }
      else if (healthScore >= 50) { riskLevel = 'medium'; mediumCount++; }
      else if (healthScore >= 25) { riskLevel = 'high'; highCount++; }
      else { riskLevel = 'critical'; criticalCount++; }

      projectHealthScores.push({ projectId: p.id, healthScore, riskLevel });
    }

    const overBudgetCount = portfolio.projectSummaries.filter((p) => p.budgetUtilization > 90).length;
    const onTrackCount = portfolio.projectSummaries.length - overBudgetCount;

    // Try to get weather for dominant region
    let weatherCondition = 'Clear';
    let weatherImpactStr = 'No weather impacts expected';
    let weatherOverview = 'Weather data unavailable';
    try {
      const regionCoords = regionId
        ? lookupRegionCoordinates(portfolio.regionSummaries.find((r) => r.regionId === regionId)?.regionName || '')
        : DEFAULT_COORDINATES;
      const weather = await dataProviderManager.getWeather(regionCoords.lat, regionCoords.lon, 7);
      weatherCondition = weather.current.condition;
      const impact = categorizeWeatherImpact(
        weather.current.conditionCode,
        weather.current.precipitation,
        weather.current.windSpeed,
      );
      weatherImpactStr = impact === 'none' ? 'No weather impacts expected' : `${impact} impact — ${weather.current.condition}`;
      weatherOverview = `Current: ${weather.current.condition}, ${weather.current.temperature}°C, precip: ${weather.current.precipitation}mm. ` +
        `7-day outlook: ${weather.daily.map((d) => `${d.date}: ${d.condition}`).join(', ')}`;
    } catch { /* non-critical */ }

    const fallbackPredictions: AIDashboardPredictions = {
      risks: { critical: criticalCount, high: highCount, medium: mediumCount, low: lowCount },
      weather: { condition: weatherCondition, impact: weatherImpactStr },
      budget: { overBudget: overBudgetCount, onTrack: onTrackCount },
      summary: `You have ${portfolio.totalProjects} project${portfolio.totalProjects !== 1 ? 's' : ''} in your portfolio. ${portfolio.activeProjects} active.`,
      highlights: this.buildDashboardHighlights(criticalCount, highCount, overBudgetCount, portfolio.activeProjects),
      projectHealthScores,
    };

    if (!claudeService.isAvailable()) {
      return { predictions: fallbackPredictions, aiPowered: false };
    }

    try {
      let portfolioPrompt = this.contextBuilder.portfolioToPromptString(portfolio);
      // Inject learning context
      const learningCtx = await this.learningService.buildLearningContext();
      if (learningCtx) portfolioPrompt += learningCtx;

      const systemPrompt = dashboardBriefingPrompt.render({
        portfolioData: portfolioPrompt,
        weatherOverview,
      });

      const result = await claudeService.completeWithJsonSchema({
        systemPrompt,
        userMessage: 'Generate the dashboard predictions JSON.',
        schema: AIDashboardPredictionsSchema,
        temperature: 0.3,
      });

      logAIUsage(this.fastify, {
        userId,
        feature: 'dashboard_predictions',
        model: 'claude',
        usage: result.usage,
        latencyMs: result.latencyMs,
        success: true,
        requestContext: { regionId },
      });

      return { predictions: result.data, aiPowered: true };
    } catch (err) {
      this.fastify.log.warn({ err }, 'AI dashboard predictions failed, using fallback');
      return { predictions: fallbackPredictions, aiPowered: false };
    }
  }

  // -----------------------------------------------------------------------
  // 5. Project Health Score
  // -----------------------------------------------------------------------

  async getProjectHealthScore(
    projectId: string,
    userId?: string,
  ): Promise<{
    healthScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    breakdown: {
      scheduleHealth: number;
      budgetHealth: number;
      riskHealth: number;
      weatherHealth: number;
    };
    aiPowered: boolean;
  }> {
    const context = await this.contextBuilder.buildProjectContext(projectId);
    const { metrics } = context;

    // Schedule health (0-100)
    const scheduleHealth = Math.max(0, Math.min(100, 50 + metrics.scheduleVariance));

    // Budget health (0-100)
    const budgetHealth = metrics.budgetUtilization <= 100
      ? Math.max(0, 100 - metrics.budgetUtilization * 0.5)
      : Math.max(0, 100 - metrics.budgetUtilization);

    // Risk health from deterministic scoring
    const { healthScore: riskHealth } = computeDeterministicRiskScore(metrics, metrics.budgetUtilization);

    // Weather health (attempt to check)
    let weatherHealth = 80; // default good
    try {
      const coords = lookupRegionCoordinates(context.project.region);
      const weather = await dataProviderManager.getWeather(coords.lat, coords.lon, 3);
      const impact = categorizeWeatherImpact(
        weather.current.conditionCode,
        weather.current.precipitation,
        weather.current.windSpeed,
      );
      weatherHealth = impact === 'none' ? 95
        : impact === 'low' ? 80
        : impact === 'moderate' ? 60
        : impact === 'high' ? 35
        : 15;
    } catch { /* use default */ }

    // Weighted composite: 40% schedule, 30% budget, 20% risk, 10% weather
    const healthScore = Math.round(
      scheduleHealth * 0.4 + budgetHealth * 0.3 + riskHealth * 0.2 + weatherHealth * 0.1,
    );

    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (healthScore >= 75) riskLevel = 'low';
    else if (healthScore >= 50) riskLevel = 'medium';
    else if (healthScore >= 25) riskLevel = 'high';
    else riskLevel = 'critical';

    return {
      healthScore,
      riskLevel,
      breakdown: { scheduleHealth, budgetHealth, riskHealth, weatherHealth },
      aiPowered: false, // Health score is always deterministic
    };
  }

  // -----------------------------------------------------------------------
  // Private: Fallback Builders
  // -----------------------------------------------------------------------

  private buildFallbackRiskAssessment(
    context: ProjectContext,
    score: number,
    severity: 'low' | 'medium' | 'high' | 'critical',
    healthScore: number,
  ): AIRiskAssessment {
    const risks: AIRiskAssessment['risks'] = [];

    if (context.metrics.scheduleVariance < -10) {
      risks.push({
        type: 'schedule',
        title: 'Schedule Delay',
        description: `Project is ${Math.abs(context.metrics.scheduleVariance)}% behind schedule.`,
        probability: context.metrics.scheduleVariance < -20 ? 5 : 3,
        impact: 4,
        severity: context.metrics.scheduleVariance < -20 ? 'critical' : 'high',
        affectedTasks: [],
        mitigations: ['Review critical path tasks', 'Consider additional resources', 'Re-negotiate timeline with stakeholders'],
      });
    }

    if (context.metrics.budgetUtilization > 90) {
      risks.push({
        type: 'budget',
        title: 'Budget Overrun Risk',
        description: `Budget utilization at ${context.metrics.budgetUtilization}%.`,
        probability: context.metrics.budgetUtilization > 100 ? 5 : 3,
        impact: 4,
        severity: context.metrics.budgetUtilization > 100 ? 'critical' : 'high',
        affectedTasks: [],
        mitigations: ['Conduct budget review', 'Identify cost-saving opportunities', 'Request supplementary funding if needed'],
      });
    }

    if (context.metrics.overdueTasks > 0) {
      risks.push({
        type: 'resource',
        title: 'Overdue Tasks',
        description: `${context.metrics.overdueTasks} task${context.metrics.overdueTasks !== 1 ? 's are' : ' is'} overdue.`,
        probability: 4,
        impact: 3,
        severity: context.metrics.overdueTasks > 5 ? 'high' : 'medium',
        affectedTasks: [],
        mitigations: ['Reassign or reprioritize overdue tasks', 'Address resource bottlenecks', 'Update task estimates'],
      });
    }

    // Always include at least a general weather risk for tropical climate
    risks.push({
      type: 'weather',
      title: 'Seasonal Weather Risk',
      description: 'Guyana has a tropical climate with two rainy seasons (May-Aug, Nov-Jan). Outdoor construction may be affected.',
      probability: 3,
      impact: 2,
      severity: 'medium',
      affectedTasks: [],
      mitigations: ['Monitor weather forecasts', 'Build weather contingency into schedule', 'Prepare covered work areas where feasible'],
    });

    const trend = context.metrics.scheduleVariance < -15 ? 'deteriorating' as const
      : context.metrics.scheduleVariance > 5 ? 'improving' as const
      : 'stable' as const;

    return {
      overallScore: score,
      overallSeverity: severity,
      healthScore,
      risks,
      summary: `Project "${context.project.name}" has ${severity} risk (score: ${score}/100). ${context.metrics.completionRate}% complete with ${context.metrics.daysRemaining} days remaining.`,
      trend,
    };
  }

  private buildFallbackWeatherImpact(
    weather: WeatherForecast,
    outdoorTasks: Array<{ name: string; status: string; progress: number }>,
  ): AIWeatherImpact {
    const impactLevel = categorizeWeatherImpact(
      weather.current.conditionCode,
      weather.current.precipitation,
      weather.current.windSpeed,
    );

    // Estimate delay from forecast
    const badDays = weather.daily.filter(
      (d) => categorizeWeatherImpact(d.conditionCode, d.precipitationAmount, d.windSpeed) !== 'none'
        && categorizeWeatherImpact(d.conditionCode, d.precipitationAmount, d.windSpeed) !== 'low',
    );
    const estimatedDelayDays = badDays.length > 0
      ? parseFloat((badDays.length * 0.5).toFixed(1))
      : 0;

    const affectedTasks = outdoorTasks.slice(0, 10).map((t) => ({
      taskName: t.name,
      reason: `Outdoor task may be affected by ${weather.current.condition.toLowerCase()}`,
      delayRisk: impactLevel === 'severe' || impactLevel === 'high' ? 'high' as const
        : impactLevel === 'moderate' ? 'medium' as const
        : 'low' as const,
    }));

    const weeklyOutlook = weather.daily.map((d) => {
      const dayImpact = categorizeWeatherImpact(d.conditionCode, d.precipitationAmount, d.windSpeed);
      return {
        date: d.date,
        condition: d.condition,
        workable: dayImpact === 'none' || dayImpact === 'low',
        risk: dayImpact !== 'none' ? `${d.precipitationAmount}mm precipitation, ${d.windSpeed}km/h wind` : undefined,
      };
    });

    const recommendations: string[] = [];
    if (impactLevel !== 'none') {
      recommendations.push('Monitor daily weather updates before dispatching outdoor crews');
    }
    if (impactLevel === 'high' || impactLevel === 'severe') {
      recommendations.push('Consider rescheduling outdoor tasks to dry days');
      recommendations.push('Ensure drainage and site protection measures are in place');
    }
    if (recommendations.length === 0) {
      recommendations.push('Weather conditions are favorable for outdoor work');
    }

    return {
      currentCondition: weather.current.condition,
      impactLevel,
      estimatedDelayDays,
      affectedTasks,
      weeklyOutlook,
      recommendations,
    };
  }

  private buildNoWeatherImpact(): AIWeatherImpact {
    return {
      currentCondition: 'Data unavailable',
      impactLevel: 'none',
      estimatedDelayDays: 0,
      affectedTasks: [],
      weeklyOutlook: [],
      recommendations: ['Weather data is currently unavailable. Check back later.'],
    };
  }

  private buildBudgetRecommendations(evm: ReturnType<typeof computeEVMMetrics>): string[] {
    const recs: string[] = [];
    if (evm.cpi < 0.9) recs.push('Cost performance is below target. Review expenditures and identify cost-saving opportunities.');
    if (evm.spi < 0.9) recs.push('Schedule performance is behind. Consider resource reallocation or scope adjustment.');
    if (evm.cpi >= 1.0 && evm.spi >= 1.0) recs.push('Project is performing well on both cost and schedule. Continue current approach.');
    if (evm.vac < 0) recs.push(`Projected budget overrun of $${Math.abs(evm.vac).toLocaleString()}. Plan for supplementary funding.`);
    if (recs.length === 0) recs.push('Budget metrics are within acceptable ranges.');
    return recs;
  }

  private buildBudgetSummary(evm: ReturnType<typeof computeEVMMetrics>, budgetAllocated: number): string {
    const status = evm.cpi >= 1.0 ? 'under budget' : 'over budget';
    const scheduleStatus = evm.spi >= 1.0 ? 'ahead of schedule' : 'behind schedule';
    return `Project is ${status} (CPI: ${evm.cpi}) and ${scheduleStatus} (SPI: ${evm.spi}). Estimated at completion: $${evm.eac.toLocaleString()} vs. $${budgetAllocated.toLocaleString()} allocated.`;
  }

  private buildDashboardHighlights(
    criticalCount: number,
    highCount: number,
    overBudgetCount: number,
    activeCount: number,
  ): AIDashboardPredictions['highlights'] {
    const highlights: AIDashboardPredictions['highlights'] = [];
    if (criticalCount > 0) {
      highlights.push({ text: `${criticalCount} project${criticalCount !== 1 ? 's' : ''} at critical risk`, type: 'risk' });
    }
    if (highCount > 0) {
      highlights.push({ text: `${highCount} project${highCount !== 1 ? 's' : ''} at high risk`, type: 'risk' });
    }
    if (overBudgetCount > 0) {
      highlights.push({ text: `${overBudgetCount} project${overBudgetCount !== 1 ? 's' : ''} near budget limit`, type: 'risk' });
    }
    if (activeCount > 0) {
      highlights.push({ text: `${activeCount} active project${activeCount !== 1 ? 's' : ''}`, type: 'info' });
    }
    if (highlights.length === 0) {
      highlights.push({ text: 'All projects within normal parameters', type: 'success' });
    }
    return highlights;
  }

  private storeRiskAssessment(projectId: string, assessment: AIRiskAssessment): void {
    const db = (this.fastify as any).mysql || (this.fastify as any).db;
    if (!db) return;

    // Fire-and-forget
    for (const risk of assessment.risks) {
      const id = crypto.randomUUID();
      db.query(
        `INSERT INTO ai_risk_assessments (id, project_id, risk_type, severity, probability, impact, description, mitigation_strategies, ai_confidence)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          projectId,
          risk.type,
          risk.severity,
          risk.probability,
          risk.impact,
          risk.description,
          JSON.stringify(risk.mitigations),
          (risk.probability * risk.impact) / 25,
        ],
      ).catch((err: Error) => {
        this.fastify.log.warn({ err }, 'Failed to store risk assessment (non-critical)');
      });
    }
  }
}
