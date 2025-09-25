import { FastifyInstance } from 'fastify';

export interface ProjectHealthData {
  // Timeline data
  startDate: Date;
  endDate: Date;
  currentDate: Date;
  
  // Budget data
  budgetAllocated: number;
  budgetSpent: number;
  
  // Resource data
  assignedResources: number;
  requiredResources: number;
  
  // Risk data
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  
  // Progress data
  completedTasks: number;
  totalTasks: number;
  
  // Issue data
  openIssues: number;
  criticalIssues: number;
  resolvedIssues: number;
}

export interface HealthFactors {
  timelineHealth: number;
  budgetHealth: number;
  resourceHealth: number;
  riskHealth: number;
  progressHealth: number;
  issueHealth: number;
}

export interface HealthScore {
  overallScore: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  healthColor: 'green' | 'yellow' | 'orange' | 'red' | 'dark-red';
  factors: HealthFactors;
  recommendations: string[];
  lastUpdated: Date;
}

export class ProjectHealthService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Calculate overall project health score
   */
  calculateHealthScore(projectData: ProjectHealthData): HealthScore {
    const factors = this.calculateHealthFactors(projectData);
    const overallScore = this.calculateOverallScore(factors);
    const healthStatus = this.determineHealthStatus(overallScore);
    const healthColor = this.getHealthColor(overallScore);
    const recommendations = this.generateRecommendations(factors, overallScore);

    return {
      overallScore: Math.round(overallScore),
      healthStatus,
      healthColor,
      factors,
      recommendations,
      lastUpdated: new Date()
    };
  }

  /**
   * Calculate individual health factors
   */
  private calculateHealthFactors(data: ProjectHealthData): HealthFactors {
    return {
      timelineHealth: this.calculateTimelineHealth(data),
      budgetHealth: this.calculateBudgetHealth(data),
      resourceHealth: this.calculateResourceHealth(data),
      riskHealth: this.calculateRiskHealth(data),
      progressHealth: this.calculateProgressHealth(data),
      issueHealth: this.calculateIssueHealth(data)
    };
  }

  /**
   * Calculate timeline health based on project progress vs time elapsed
   */
  private calculateTimelineHealth(data: ProjectHealthData): number {
    const totalDays = Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((data.currentDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((data.endDate.getTime() - data.currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // If project hasn't started yet
    if (daysElapsed <= 0) {
      return 100;
    }
    
    // If project is overdue
    if (daysRemaining < 0) {
      return Math.max(0, 50 + (daysRemaining * 2)); // Penalty for being overdue
    }
    
    // Calculate expected progress vs actual progress
    const expectedProgress = (daysElapsed / totalDays) * 100;
    const actualProgress = (data.completedTasks / data.totalTasks) * 100;
    
    // Timeline health based on progress alignment
    const progressAlignment = 100 - Math.abs(expectedProgress - actualProgress);
    
    // Bonus for being ahead of schedule
    if (actualProgress > expectedProgress) {
      return Math.min(100, progressAlignment + 10);
    }
    
    return Math.max(0, progressAlignment);
  }

  /**
   * Calculate budget health based on spending vs allocation
   */
  private calculateBudgetHealth(data: ProjectHealthData): number {
    if (data.budgetAllocated === 0) return 100; // No budget allocated
    
    const budgetUtilization = (data.budgetSpent / data.budgetAllocated) * 100;
    
    // Ideal range is 70-90% of budget used
    if (budgetUtilization >= 70 && budgetUtilization <= 90) {
      return 100; // Perfect budget utilization
    }
    
    if (budgetUtilization < 70) {
      // Under budget - good but might indicate delays
      return Math.max(60, 100 - (70 - budgetUtilization) * 2);
    }
    
    if (budgetUtilization > 90) {
      // Over budget - concerning
      return Math.max(0, 100 - (budgetUtilization - 90) * 3);
    }
    
    return 100;
  }

  /**
   * Calculate resource health based on team allocation
   */
  private calculateResourceHealth(data: ProjectHealthData): number {
    if (data.requiredResources === 0) return 100; // No resources required
    
    const resourceUtilization = (data.assignedResources / data.requiredResources) * 100;
    
    // Optimal range is 90-110% of required resources
    if (resourceUtilization >= 90 && resourceUtilization <= 110) {
      return 100;
    }
    
    if (resourceUtilization < 90) {
      // Understaffed
      return Math.max(0, resourceUtilization);
    }
    
    if (resourceUtilization > 110) {
      // Overstaffed - might be inefficient
      return Math.max(60, 100 - (resourceUtilization - 110) * 2);
    }
    
    return 100;
  }

  /**
   * Calculate risk health based on number and severity of risks
   */
  private calculateRiskHealth(data: ProjectHealthData): number {
    const totalRisks = data.highRisks + data.mediumRisks + data.lowRisks;
    
    if (totalRisks === 0) return 100; // No risks identified
    
    // Weighted risk calculation
    const riskScore = (data.highRisks * 10) + (data.mediumRisks * 5) + (data.lowRisks * 2);
    
    // Risk health decreases with more risks
    return Math.max(0, 100 - riskScore);
  }

  /**
   * Calculate progress health based on task completion
   */
  private calculateProgressHealth(data: ProjectHealthData): number {
    if (data.totalTasks === 0) return 100; // No tasks defined
    
    return (data.completedTasks / data.totalTasks) * 100;
  }

  /**
   * Calculate issue health based on open and critical issues
   */
  private calculateIssueHealth(data: ProjectHealthData): number {
    const totalIssues = data.openIssues + data.resolvedIssues;
    
    if (totalIssues === 0) return 100; // No issues
    
    // Penalty for open issues, especially critical ones
    const issuePenalty = (data.openIssues * 5) + (data.criticalIssues * 15);
    
    return Math.max(0, 100 - issuePenalty);
  }

  /**
   * Calculate overall health score using weighted factors
   */
  private calculateOverallScore(factors: HealthFactors): number {
    const weights = {
      timeline: 0.25,
      budget: 0.20,
      resource: 0.15,
      risk: 0.20,
      progress: 0.10,
      issue: 0.10
    };

    return (
      factors.timelineHealth * weights.timeline +
      factors.budgetHealth * weights.budget +
      factors.resourceHealth * weights.resource +
      factors.riskHealth * weights.risk +
      factors.progressHealth * weights.progress +
      factors.issueHealth * weights.issue
    );
  }

  /**
   * Determine health status based on score
   */
  private determineHealthStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    if (score >= 60) return 'poor';
    return 'critical';
  }

  /**
   * Get health color based on score
   */
  private getHealthColor(score: number): 'green' | 'yellow' | 'orange' | 'red' | 'dark-red' {
    if (score >= 90) return 'green';
    if (score >= 80) return 'yellow';
    if (score >= 70) return 'orange';
    if (score >= 60) return 'red';
    return 'dark-red';
  }

  /**
   * Generate recommendations based on health factors
   */
  private generateRecommendations(factors: HealthFactors, overallScore: number): string[] {
    const recommendations: string[] = [];

    // Timeline recommendations
    if (factors.timelineHealth < 70) {
      recommendations.push('Review project timeline and identify bottlenecks');
      recommendations.push('Consider adding resources to critical path tasks');
    }

    // Budget recommendations
    if (factors.budgetHealth < 70) {
      if (factors.budgetHealth < 50) {
        recommendations.push('Budget overrun detected - review expenses immediately');
      } else {
        recommendations.push('Monitor budget closely - approaching limits');
      }
    }

    // Resource recommendations
    if (factors.resourceHealth < 70) {
      recommendations.push('Resource allocation needs attention');
      if (factors.resourceHealth < 50) {
        recommendations.push('Consider hiring additional team members');
      }
    }

    // Risk recommendations
    if (factors.riskHealth < 70) {
      recommendations.push('High number of risks identified - develop mitigation strategies');
      recommendations.push('Schedule regular risk review meetings');
    }

    // Progress recommendations
    if (factors.progressHealth < 70) {
      recommendations.push('Project progress is behind schedule');
      recommendations.push('Review task assignments and dependencies');
    }

    // Issue recommendations
    if (factors.issueHealth < 70) {
      recommendations.push('Multiple issues require immediate attention');
      recommendations.push('Implement issue tracking and resolution process');
    }

    // General recommendations based on overall score
    if (overallScore < 60) {
      recommendations.push('Project health is critical - escalate to senior management');
      recommendations.push('Consider project restart or major scope reduction');
    } else if (overallScore < 70) {
      recommendations.push('Project needs immediate intervention');
      recommendations.push('Schedule emergency project review meeting');
    }

    return recommendations;
  }
}
