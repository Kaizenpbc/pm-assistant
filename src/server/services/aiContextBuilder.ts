import { FastifyInstance } from 'fastify';

export interface ProjectContext {
  project: {
    id: string;
    name: string;
    code: string;
    description: string;
    category: string;
    status: string;
    priority: string;
    budgetAllocated: number;
    budgetSpent: number;
    startDate: string;
    endDate: string;
    region: string;
  };
  tasks: TaskContext[];
  schedule: ScheduleContext[];
  team: TeamMember[];
  metrics: ProjectMetrics;
  region?: RegionContext;
}

export interface TaskContext {
  id: string;
  name: string;
  status: string;
  priority: string;
  progress: number;
  estimatedDays: number;
  actualDays?: number;
  assignedTo?: string;
  dueDate?: string;
  dependencies?: string[];
  isOverdue: boolean;
}

export interface ScheduleContext {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  taskCount: number;
  completedTasks: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  taskCount: number;
  activeTaskCount: number;
}

export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  budgetUtilization: number;
  daysRemaining: number;
  daysElapsed: number;
  scheduleVariance: number; // positive = ahead, negative = behind
}

export interface RegionContext {
  id: string;
  name: string;
  code: string;
  activeProjects: number;
  totalBudget: number;
}

export interface PortfolioContext {
  totalProjects: number;
  activeProjects: number;
  totalBudget: number;
  totalSpent: number;
  projectSummaries: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    budgetUtilization: number;
    healthIndicator: 'good' | 'warning' | 'critical';
  }>;
  regionSummaries: Array<{
    regionId: string;
    regionName: string;
    projectCount: number;
    activeCount: number;
    totalBudget: number;
  }>;
}

export class AIContextBuilder {
  private fastify: FastifyInstance;
  private cache: Map<string, { data: any; expiresAt: number }> = new Map();
  private cacheTTLMs = 60_000; // 1 minute

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async buildProjectContext(projectId: string): Promise<ProjectContext> {
    const cacheKey = `project:${projectId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const db = (this.fastify as any).mysql || (this.fastify as any).db;

    // Fetch project
    const [projectRows]: any = await db.query(
      `SELECT p.*, r.name as region_name, r.code as region_code
       FROM projects p
       LEFT JOIN regions r ON p.region_id = r.id
       WHERE p.id = ?`,
      [projectId]
    );
    const project = projectRows[0];
    if (!project) throw new Error(`Project ${projectId} not found`);

    // Fetch schedules with task counts
    const [schedules]: any = await db.query(
      `SELECT ps.*,
              COUNT(t.id) as task_count,
              SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
       FROM project_schedules ps
       LEFT JOIN tasks t ON ps.id = t.schedule_id
       WHERE ps.project_id = ?
       GROUP BY ps.id`,
      [projectId]
    );

    // Fetch tasks
    const [tasks]: any = await db.query(
      `SELECT t.*, CONCAT(u.first_name, ' ', u.last_name) as assignee_name
       FROM tasks t
       JOIN project_schedules ps ON t.schedule_id = ps.id
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE ps.project_id = ?
       ORDER BY t.due_date ASC`,
      [projectId]
    );

    // Fetch team members
    const [teamRows]: any = await db.query(
      `SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) as name, u.role,
              COUNT(t.id) as task_count,
              SUM(CASE WHEN t.status IN ('pending', 'in_progress') THEN 1 ELSE 0 END) as active_task_count
       FROM users u
       JOIN tasks t ON t.assigned_to = u.id
       JOIN project_schedules ps ON t.schedule_id = ps.id
       WHERE ps.project_id = ?
       GROUP BY u.id, u.first_name, u.last_name, u.role`,
      [projectId]
    );

    const now = new Date();
    const taskContexts: TaskContext[] = tasks.map((t: any) => ({
      id: t.id,
      name: t.name,
      status: t.status,
      priority: t.priority,
      progress: t.progress_percentage || 0,
      estimatedDays: t.estimated_days || 0,
      actualDays: t.actual_duration_hours ? Math.ceil(t.actual_duration_hours / 8) : undefined,
      assignedTo: t.assignee_name || undefined,
      dueDate: t.due_date || undefined,
      isOverdue: t.due_date ? new Date(t.due_date) < now && t.status !== 'completed' : false,
    }));

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
    const overdueTasks = taskContexts.filter(t => t.isOverdue).length;

    const startDate = new Date(project.start_date || project.created_at);
    const endDate = new Date(project.end_date || now);
    const daysElapsed = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / 86400000));
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / 86400000));
    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
    const expectedProgress = Math.min(100, Math.round((daysElapsed / totalDays) * 100));
    const actualProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const context: ProjectContext = {
      project: {
        id: project.id,
        name: project.name,
        code: project.code,
        description: project.description || '',
        category: project.category || '',
        status: project.status,
        priority: project.priority,
        budgetAllocated: parseFloat(project.budget_allocated) || 0,
        budgetSpent: parseFloat(project.budget_spent) || 0,
        startDate: project.start_date,
        endDate: project.end_date,
        region: project.region_name || '',
      },
      tasks: taskContexts,
      schedule: schedules.map((s: any) => ({
        id: s.id,
        name: s.name,
        startDate: s.start_date,
        endDate: s.end_date,
        status: s.status,
        taskCount: parseInt(s.task_count) || 0,
        completedTasks: parseInt(s.completed_tasks) || 0,
      })),
      team: teamRows.map((m: any) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        taskCount: parseInt(m.task_count) || 0,
        activeTaskCount: parseInt(m.active_task_count) || 0,
      })),
      metrics: {
        totalTasks,
        completedTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        budgetUtilization: project.budget_allocated > 0
          ? Math.round((parseFloat(project.budget_spent) / parseFloat(project.budget_allocated)) * 100)
          : 0,
        daysRemaining,
        daysElapsed,
        scheduleVariance: actualProgress - expectedProgress,
      },
    };

    this.setCache(cacheKey, context);
    return context;
  }

  async buildPortfolioContext(regionId?: string): Promise<PortfolioContext> {
    const cacheKey = `portfolio:${regionId || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const db = (this.fastify as any).mysql || (this.fastify as any).db;

    const whereClause = regionId ? 'WHERE p.region_id = ?' : '';
    const params = regionId ? [regionId] : [];

    const [projects]: any = await db.query(
      `SELECT p.*, r.name as region_name, r.id as region_id,
              COUNT(t.id) as task_count,
              SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
       FROM projects p
       LEFT JOIN regions r ON p.region_id = r.id
       LEFT JOIN project_schedules ps ON p.id = ps.project_id
       LEFT JOIN tasks t ON ps.id = t.schedule_id
       ${whereClause}
       GROUP BY p.id`,
      params
    );

    const totalBudget = projects.reduce((sum: number, p: any) => sum + (parseFloat(p.budget_allocated) || 0), 0);
    const totalSpent = projects.reduce((sum: number, p: any) => sum + (parseFloat(p.budget_spent) || 0), 0);

    // Build region summaries
    const regionMap = new Map<string, any>();
    for (const p of projects) {
      if (!p.region_id) continue;
      if (!regionMap.has(p.region_id)) {
        regionMap.set(p.region_id, {
          regionId: p.region_id,
          regionName: p.region_name,
          projectCount: 0,
          activeCount: 0,
          totalBudget: 0,
        });
      }
      const region = regionMap.get(p.region_id);
      region.projectCount++;
      if (p.status === 'active') region.activeCount++;
      region.totalBudget += parseFloat(p.budget_allocated) || 0;
    }

    const context: PortfolioContext = {
      totalProjects: projects.length,
      activeProjects: projects.filter((p: any) => p.status === 'active').length,
      totalBudget,
      totalSpent,
      projectSummaries: projects.map((p: any) => {
        const taskCount = parseInt(p.task_count) || 0;
        const completedCount = parseInt(p.completed_tasks) || 0;
        const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
        const budgetUtil = p.budget_allocated > 0
          ? Math.round((parseFloat(p.budget_spent) / parseFloat(p.budget_allocated)) * 100) : 0;

        let healthIndicator: 'good' | 'warning' | 'critical' = 'good';
        if (budgetUtil > 90 || p.status === 'on_hold') healthIndicator = 'warning';
        if (budgetUtil > 100 || p.status === 'cancelled') healthIndicator = 'critical';

        return {
          id: p.id,
          name: p.name,
          status: p.status,
          progress,
          budgetUtilization: budgetUtil,
          healthIndicator,
        };
      }),
      regionSummaries: Array.from(regionMap.values()),
    };

    this.setCache(cacheKey, context);
    return context;
  }

  toPromptString(context: ProjectContext): string {
    const { project, tasks, metrics, team } = context;
    const overdueTasks = tasks.filter(t => t.isOverdue);
    const criticalTasks = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high');

    let prompt = `## Project: ${project.name}\n`;
    prompt += `- Status: ${project.status} | Priority: ${project.priority} | Category: ${project.category}\n`;
    prompt += `- Region: ${project.region}\n`;
    prompt += `- Timeline: ${project.startDate} to ${project.endDate} (${metrics.daysRemaining} days remaining, ${metrics.daysElapsed} days elapsed)\n`;
    prompt += `- Budget: $${project.budgetAllocated.toLocaleString()} allocated, $${project.budgetSpent.toLocaleString()} spent (${metrics.budgetUtilization}%)\n`;
    prompt += `- Tasks: ${metrics.totalTasks} total, ${metrics.completedTasks} completed (${metrics.completionRate}%), ${metrics.overdueTasks} overdue\n`;
    prompt += `- Schedule Variance: ${metrics.scheduleVariance > 0 ? '+' : ''}${metrics.scheduleVariance}% (${metrics.scheduleVariance >= 0 ? 'ahead' : 'behind'} schedule)\n`;

    if (team.length > 0) {
      prompt += `\n### Team (${team.length} members):\n`;
      team.forEach(m => {
        prompt += `- ${m.name} (${m.role}): ${m.activeTaskCount} active tasks of ${m.taskCount} total\n`;
      });
    }

    if (overdueTasks.length > 0) {
      prompt += `\n### Overdue Tasks (${overdueTasks.length}):\n`;
      overdueTasks.slice(0, 10).forEach(t => {
        prompt += `- ${t.name}: due ${t.dueDate}, assigned to ${t.assignedTo || 'unassigned'}\n`;
      });
    }

    if (criticalTasks.length > 0) {
      prompt += `\n### High Priority Tasks (${criticalTasks.length}):\n`;
      criticalTasks.slice(0, 10).forEach(t => {
        prompt += `- ${t.name} [${t.priority}]: ${t.progress}% complete, ${t.status}\n`;
      });
    }

    return prompt;
  }

  portfolioToPromptString(context: PortfolioContext): string {
    let prompt = `## Portfolio Summary\n`;
    prompt += `- ${context.totalProjects} projects, ${context.activeProjects} active\n`;
    prompt += `- Total Budget: $${context.totalBudget.toLocaleString()}, Spent: $${context.totalSpent.toLocaleString()} (${context.totalBudget > 0 ? Math.round(context.totalSpent / context.totalBudget * 100) : 0}%)\n\n`;

    const critical = context.projectSummaries.filter(p => p.healthIndicator === 'critical');
    const warning = context.projectSummaries.filter(p => p.healthIndicator === 'warning');

    if (critical.length > 0) {
      prompt += `### Critical Projects (${critical.length}):\n`;
      critical.forEach(p => {
        prompt += `- ${p.name}: ${p.status}, ${p.progress}% complete, budget ${p.budgetUtilization}%\n`;
      });
    }

    if (warning.length > 0) {
      prompt += `\n### Warning Projects (${warning.length}):\n`;
      warning.forEach(p => {
        prompt += `- ${p.name}: ${p.status}, ${p.progress}% complete, budget ${p.budgetUtilization}%\n`;
      });
    }

    if (context.regionSummaries.length > 0) {
      prompt += `\n### Regions:\n`;
      context.regionSummaries.forEach(r => {
        prompt += `- ${r.regionName}: ${r.projectCount} projects, ${r.activeCount} active, $${r.totalBudget.toLocaleString()} budget\n`;
      });
    }

    return prompt;
  }

  clearCache() {
    this.cache.clear();
  }

  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { data, expiresAt: Date.now() + this.cacheTTLMs });
  }
}
