declare class ApiService {
    private api;
    constructor();
    login(username: string, password: string): Promise<any>;
    register(userData: {
        username: string;
        email: string;
        password: string;
        fullName: string;
    }): Promise<any>;
    logout(): Promise<any>;
    getCurrentUser(): Promise<any>;
    getProjects(): Promise<any>;
    getProject(id: string): Promise<any>;
    createProject(projectData: {
        name: string;
        description?: string;
        status?: string;
        priority?: string;
        budgetAllocated?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<any>;
    updateProject(id: string, projectData: any): Promise<any>;
    deleteProject(id: string): Promise<any>;
    getSchedules(projectId: string): Promise<any>;
    createSchedule(scheduleData: {
        projectId: string;
        name: string;
        description?: string;
        startDate: string;
        endDate: string;
    }): Promise<any>;
    updateSchedule(scheduleId: string, scheduleData: any): Promise<any>;
    getTasks(scheduleId: string): Promise<any>;
    createTask(scheduleId: string, taskData: {
        name: string;
        description?: string;
        status?: string;
        priority?: string;
        assignedTo?: string;
        dueDate?: string;
        estimatedDays?: number;
        workEffort?: string;
        dependency?: string;
        risks?: string;
        issues?: string;
        comments?: string;
    }): Promise<any>;
    updateTask(scheduleId: string, taskId: string, taskData: any): Promise<any>;
    analyzeProject(projectData: {
        projectDescription: string;
        projectType?: string;
        existingTasks?: any[];
    }): Promise<any>;
    suggestDependencies(taskData: {
        tasks: any[];
        projectContext?: string;
    }): Promise<any>;
    optimizeSchedule(optimizationData: {
        scheduleId: string;
        optimizationGoals?: string[];
        constraints?: any;
    }): Promise<any>;
    getProjectInsights(projectId: string): Promise<any>;
    getProjectHealth(projectId: string): Promise<any>;
    calculateHealthScore(healthData: {
        startDate: string;
        endDate: string;
        currentDate?: string;
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
    }): Promise<any>;
}
export declare const apiService: ApiService;
export {};
//# sourceMappingURL=api.d.ts.map