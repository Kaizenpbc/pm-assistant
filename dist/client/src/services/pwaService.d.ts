export interface PWAInstallPrompt {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
    }>;
}
export interface PWAUpdateInfo {
    isUpdateAvailable: boolean;
    newVersion?: string;
    currentVersion?: string;
}
declare class PWAService {
    private deferredPrompt;
    private isInstalled;
    private isOnline;
    private updateAvailable;
    private registration;
    constructor();
    private initialize;
    private checkIfInstalled;
    private handleInstallPrompt;
    private handleAppInstalled;
    private handleOnline;
    private handleOffline;
    private registerServiceWorker;
    private handleServiceWorkerUpdate;
    private checkForUpdates;
    installApp(): Promise<boolean>;
    updateApp(): Promise<void>;
    canInstall(): boolean;
    isAppInstalled(): boolean;
    isAppOnline(): boolean;
    hasUpdateAvailable(): boolean;
    getAppInfo(): Promise<{
        isInstalled: boolean;
        isOnline: boolean;
        hasUpdate: boolean;
        version: string;
        platform: string;
    }>;
    cacheData(key: string, data: any): Promise<void>;
    getCachedData(key: string): Promise<any>;
    clearCache(): Promise<void>;
    queueBackgroundSync(tag: string, data: any): Promise<void>;
    requestNotificationPermission(): Promise<NotificationPermission>;
    showNotification(title: string, options?: NotificationOptions): Promise<void>;
    private showInstallPrompt;
    private showUpdatePrompt;
    private showToastNotification;
    private trackEvent;
    private syncPendingData;
    private getPlatform;
}
export declare const pwaService: PWAService;
export default pwaService;
//# sourceMappingURL=pwaService.d.ts.map