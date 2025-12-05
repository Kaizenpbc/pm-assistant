declare class BackgroundSyncService {
    private isOnline;
    private syncInProgress;
    private syncListeners;
    constructor();
    private setupOnlineStatusListener;
    private notifyListeners;
    addSyncListener(listener: (isOnline: boolean) => void): void;
    removeSyncListener(listener: (isOnline: boolean) => void): void;
    isNetworkOnline(): boolean;
    triggerSync(): Promise<void>;
    private syncActions;
    private syncAction;
    private processSyncResults;
    queueOfflineAction(type: string, data: any): Promise<void>;
    getSyncStatus(): Promise<{
        isOnline: boolean;
        syncInProgress: boolean;
        pendingActions: number;
        lastSyncTime?: number;
    }>;
}
export declare const backgroundSyncService: BackgroundSyncService;
export {};
//# sourceMappingURL=backgroundSyncService.d.ts.map