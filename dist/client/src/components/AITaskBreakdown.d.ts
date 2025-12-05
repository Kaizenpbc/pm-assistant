import React from 'react';
interface TaskSuggestion {
    id: string;
    name: string;
    description: string;
    estimatedDays: number;
    complexity: 'low' | 'medium' | 'high';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dependencies: string[];
    riskLevel: number;
    category: string;
    skills: string[];
    deliverables: string[];
}
interface AITaskBreakdownProps {
    onTasksGenerated: (tasks: TaskSuggestion[], phases?: any[]) => void;
    projectId?: string;
    existingDescription?: string;
    projectName?: string;
    projectCode?: string;
    projectStatus?: string;
}
export declare const AITaskBreakdown: React.FC<AITaskBreakdownProps>;
export {};
//# sourceMappingURL=AITaskBreakdown.d.ts.map