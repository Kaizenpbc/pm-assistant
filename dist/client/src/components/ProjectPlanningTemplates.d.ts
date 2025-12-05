import React from 'react';
interface ProjectTemplate {
    id: string;
    name: string;
    icon: React.ComponentType<any>;
    phases: ProjectPhase[];
    documents: ProjectDocument[];
    estimatedDuration: string;
    description: string;
    category: string;
    budgetRange: string;
}
interface ProjectPhase {
    id: string;
    name: string;
    description: string;
    tasks: ProjectTask[];
    estimatedDays: number;
    dependencies?: string[];
}
interface ProjectTask {
    id: string;
    name: string;
    description: string;
    estimatedHours: number;
    requiredSkills?: string[];
    deliverables?: string[];
}
interface ProjectDocument {
    id: string;
    name: string;
    description: string;
    required: boolean;
    template?: string;
}
interface ProjectPlanningTemplatesProps {
    projectCategory: string;
    onTemplateSelect: (template: ProjectTemplate) => void;
    onClose: () => void;
}
declare const ProjectPlanningTemplates: React.FC<ProjectPlanningTemplatesProps>;
export default ProjectPlanningTemplates;
//# sourceMappingURL=ProjectPlanningTemplates.d.ts.map