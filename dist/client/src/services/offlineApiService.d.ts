declare class OfflineApiService {
    private isOnline;
    constructor();
    private setupOnlineStatusListener;
    private executeOrQueue;
    createProject(projectData: any): Promise<any>;
    updateProject(projectId: string, projectData: any): Promise<any>;
    createSchedule(scheduleData: any): Promise<any>;
    updateSchedule(scheduleId: string, scheduleData: any): Promise<any>;
    createTask(scheduleId: string, taskData: any): Promise<any>;
    updateTask(taskId: string, taskData: any): Promise<any>;
    deleteTask(taskId: string): Promise<unknown>;
    getProjects(): Promise<any>;
    getProject(projectId: string): Promise<any>;
    getSchedules(projectId: string): Promise<any>;
    getSchedule(scheduleId: string): Promise<any>;
    getTasks(scheduleId: string): Promise<any>;
    login(username: string, password: string): Promise<any>;
    logout(): Promise<any>;
    getCurrentUser(): Promise<any>;
    isNetworkOnline(): boolean;
    getSyncStatus(): Promise<{
        isOnline: boolean;
        syncInProgress: boolean;
        pendingActions: number;
        lastSyncTime?: number;
    }>;
    triggerSync(): Promise<void>;
}
export declare const offlineApiService: OfflineApiService;
export {};
//# sourceMappingURL=offlineApiService.d.ts.map