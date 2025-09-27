import { FastifyInstance } from 'fastify';
export interface ProjectHealthData {
    startDate: Date;
    endDate: Date;
    currentDate: Date;
    budgetAllocated: number;
    budgetSpent: number;
    assignedResources: number;
    requiredResources: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
    completedTasks: number;
    totalTasks: number;
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
export declare class ProjectHealthService {
    private fastify;
    constructor(fastify: FastifyInstance);
    calculateHealthScore(projectData: ProjectHealthData): HealthScore;
    private calculateHealthFactors;
    private calculateTimelineHealth;
    private calculateBudgetHealth;
    private calculateResourceHealth;
    private calculateRiskHealth;
    private calculateProgressHealth;
    private calculateIssueHealth;
    private calculateOverallScore;
    private determineHealthStatus;
    private getHealthColor;
    private generateRecommendations;
}
//# sourceMappingURL=ProjectHealthService.d.ts.map