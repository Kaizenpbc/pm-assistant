import { FastifyInstance } from 'fastify';
export interface LearningData {
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
    timestamp: string;
}
export interface LearningInsights {
    projectTypeAccuracy: Record<string, number>;
    taskEstimationAccuracy: Record<string, number>;
    complexityAccuracy: Record<string, number>;
    riskAccuracy: Record<string, number>;
    popularTaskPatterns: Record<string, any[]>;
    improvementSuggestions: string[];
}
export declare class AILearningService {
    private fastify;
    private learningData;
    constructor(fastify: FastifyInstance);
    recordFeedback(learningData: LearningData): Promise<void>;
    getLearningInsights(): Promise<LearningInsights>;
    applyLearning(taskSuggestions: any[], projectType: string, projectDescription: string): Promise<any[]>;
    private generateInsights;
    private calculateProjectTypeAccuracy;
    private adjustEstimateBasedOnLearning;
    private adjustComplexityBasedOnLearning;
    private addPopularTasks;
    private findPopularTasks;
    private generateImprovementSuggestions;
    private groupBy;
    private loadLearningData;
    private saveLearningData;
}
//# sourceMappingURL=aiLearning.d.ts.map