export interface Project {
    id: string;
    name: string;
    description?: string;
    category?: string;
    status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    budgetAllocated?: number;
    budgetSpent: number;
    startDate?: Date;
    endDate?: Date;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateProjectData {
    name: string;
    description?: string;
    category?: string;
    status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    budgetAllocated?: number;
    startDate?: Date;
    endDate?: Date;
    userId: string;
}
export declare class ProjectService {
    private projects;
    findById(id: string, userId: string): Promise<Project | null>;
    findByUserId(userId: string): Promise<Project[]>;
    create(data: CreateProjectData): Promise<Project>;
    update(id: string, data: Partial<Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>, userId: string): Promise<Project | null>;
    delete(id: string, userId: string): Promise<boolean>;
}
//# sourceMappingURL=ProjectService.d.ts.map