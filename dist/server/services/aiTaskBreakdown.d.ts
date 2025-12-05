import { FastifyInstance } from 'fastify';
export interface TaskSuggestion {
    id: string;
    name: string;
    description: string;
    estimatedDays: number;
    complexity: 'low' | 'medium' | 'high';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dependencies: string[];
    riskLevel: number;
    suggestedAssignee?: string;
    category: string;
    skills: string[];
    deliverables: string[];
}
export interface ProjectAnalysis {
    projectType: string;
    complexity: 'low' | 'medium' | 'high';
    estimatedDuration: number;
    riskLevel: number;
    suggestedPhases: any[];
    taskSuggestions: TaskSuggestion[];
    criticalPath: string[];
    resourceRequirements: {
        developers?: number;
        designers?: number;
        testers?: number;
        managers?: number;
    };
}
export declare class AITaskBreakdownService {
    private fastify;
    private learningService;
    constructor(fastify: FastifyInstance);
    analyzeProject(projectDescription: string, projectType?: string): Promise<ProjectAnalysis>;
    recordFeedback(feedbackData: {
        projectType: string;
        projectDescription: string;
        generatedTasks: any[];
        userFeedback: {
            acceptedTasks: string[];
            rejectedTasks: string[];
            modifiedTasks: any[];
            actualDurations?: Record<string, number>;
            actualComplexities?: Record<string, string>;
        };
    }): Promise<void>;
    getLearningInsights(): Promise<any>;
    private extractProjectInfo;
    private generateTaskSuggestions;
    private organizeTasksByPhases;
    private organizeConstructionPhases;
    private organizeDefaultPhases;
    private getBaseTasksForType;
    private customizeTasksForProject;
    private addTaskDependencies;
    private calculateProjectComplexity;
    private calculateRiskLevel;
    private identifyCriticalPath;
    private estimateResourceRequirements;
    private calculateEstimatedDuration;
    private adjustRiskForProject;
    private adjustEstimateForProject;
    private adjustComplexityForProject;
}
//# sourceMappingURL=aiTaskBreakdown.d.ts.map