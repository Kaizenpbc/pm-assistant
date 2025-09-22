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
}
export declare const apiService: ApiService;
export {};
//# sourceMappingURL=api.d.ts.map