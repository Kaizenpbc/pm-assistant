interface OfflineAction {
    id: string;
    type: 'CREATE_PROJECT' | 'UPDATE_PROJECT' | 'CREATE_SCHEDULE' | 'UPDATE_SCHEDULE' | 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK';
    data: any;
    timestamp: number;
    retryCount: number;
    maxRetries: number;
}
interface CachedProject {
    id: string;
    data: any;
    lastModified: number;
    isOffline: boolean;
}
interface CachedSchedule {
    id: string;
    projectId: string;
    data: any;
    lastModified: number;
    isOffline: boolean;
}
declare class IndexedDBService {
    private dbName;
    private version;
    private db;
    initialize(): Promise<void>;
    addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void>;
    getPendingActions(): Promise<OfflineAction[]>;
    removeOfflineAction(actionId: string): Promise<void>;
    updateOfflineActionRetryCount(actionId: string, newRetryCount: number): Promise<void>;
    cacheProject(project: CachedProject): Promise<void>;
    getCachedProjects(): Promise<CachedProject[]>;
    cacheSchedule(schedule: CachedSchedule): Promise<void>;
    getCachedSchedules(projectId?: string): Promise<CachedSchedule[]>;
    clearAllData(): Promise<void>;
    getStorageInfo(): Promise<{
        offlineActions: number;
        cachedProjects: number;
        cachedSchedules: number;
        totalSize: number;
    }>;
}
export declare const indexedDBService: IndexedDBService;
export {};
//# sourceMappingURL=indexedDBService.d.ts.map