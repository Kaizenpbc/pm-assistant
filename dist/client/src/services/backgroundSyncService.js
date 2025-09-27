"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backgroundSyncService = void 0;
const indexedDBService_1 = require("./indexedDBService");
const api_1 = require("./api");
class BackgroundSyncService {
    isOnline = navigator.onLine;
    syncInProgress = false;
    syncListeners = [];
    constructor() {
        this.setupOnlineStatusListener();
    }
    setupOnlineStatusListener() {
        window.addEventListener('online', () => {
            console.log('🌐 Network connection restored');
            this.isOnline = true;
            this.notifyListeners(true);
            this.triggerSync();
        });
        window.addEventListener('offline', () => {
            console.log('📴 Network connection lost');
            this.isOnline = false;
            this.notifyListeners(false);
        });
    }
    notifyListeners(isOnline) {
        this.syncListeners.forEach(listener => {
            try {
                listener(isOnline);
            }
            catch (error) {
                console.error('❌ Error in sync listener:', error);
            }
        });
    }
    addSyncListener(listener) {
        this.syncListeners.push(listener);
    }
    removeSyncListener(listener) {
        const index = this.syncListeners.indexOf(listener);
        if (index > -1) {
            this.syncListeners.splice(index, 1);
        }
    }
    isNetworkOnline() {
        return this.isOnline;
    }
    async triggerSync() {
        if (this.syncInProgress || !this.isOnline) {
            console.log('⏸️ Sync skipped - already in progress or offline');
            return;
        }
        this.syncInProgress = true;
        console.log('🔄 Starting background sync...');
        try {
            const pendingActions = await indexedDBService_1.indexedDBService.getPendingActions();
            if (pendingActions.length === 0) {
                console.log('✅ No pending actions to sync');
                return;
            }
            console.log(`📋 Syncing ${pendingActions.length} pending actions`);
            const syncResults = await this.syncActions(pendingActions);
            await this.processSyncResults(syncResults);
            console.log('✅ Background sync completed');
        }
        catch (error) {
            console.error('❌ Background sync failed:', error);
        }
        finally {
            this.syncInProgress = false;
        }
    }
    async syncActions(actions) {
        const results = [];
        for (const action of actions) {
            try {
                console.log(`🔄 Syncing action: ${action.type} (${action.id})`);
                const result = await this.syncAction(action);
                results.push(result);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            catch (error) {
                console.error(`❌ Failed to sync action ${action.id}:`, error);
                results.push({
                    success: false,
                    actionId: action.id,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        return results;
    }
    async syncAction(action) {
        try {
            let success = false;
            let error;
            switch (action.type) {
                case 'CREATE_PROJECT':
                    try {
                        await api_1.apiService.createProject(action.data);
                        success = true;
                    }
                    catch (err) {
                        error = err.message || 'Failed to create project';
                    }
                    break;
                case 'UPDATE_PROJECT':
                    try {
                        await api_1.apiService.updateProject(action.data.id, action.data);
                        success = true;
                    }
                    catch (err) {
                        error = err.message || 'Failed to update project';
                    }
                    break;
                case 'CREATE_SCHEDULE':
                    try {
                        await api_1.apiService.createSchedule(action.data);
                        success = true;
                    }
                    catch (err) {
                        error = err.message || 'Failed to create schedule';
                    }
                    break;
                case 'UPDATE_SCHEDULE':
                    try {
                        await api_1.apiService.updateSchedule(action.data.id, action.data);
                        success = true;
                    }
                    catch (err) {
                        error = err.message || 'Failed to update schedule';
                    }
                    break;
                case 'CREATE_TASK':
                    try {
                        await api_1.apiService.createTask(action.data.scheduleId, action.data);
                        success = true;
                    }
                    catch (err) {
                        error = err.message || 'Failed to create task';
                    }
                    break;
                case 'UPDATE_TASK':
                    try {
                        await api_1.apiService.updateTask(action.data.id, action.data);
                        success = true;
                    }
                    catch (err) {
                        error = err.message || 'Failed to update task';
                    }
                    break;
                case 'DELETE_TASK':
                    try {
                        await api_1.apiService.deleteTask(action.data.id);
                        success = true;
                    }
                    catch (err) {
                        error = err.message || 'Failed to delete task';
                    }
                    break;
                default:
                    error = `Unknown action type: ${action.type}`;
            }
            return {
                success,
                actionId: action.id,
                error
            };
        }
        catch (error) {
            return {
                success: false,
                actionId: action.id,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async processSyncResults(results) {
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        console.log(`✅ Successfully synced ${successful.length} actions`);
        if (failed.length > 0) {
            console.log(`❌ Failed to sync ${failed.length} actions`);
        }
        for (const result of successful) {
            try {
                await indexedDBService_1.indexedDBService.removeOfflineAction(result.actionId);
                console.log(`🗑️ Removed synced action: ${result.actionId}`);
            }
            catch (error) {
                console.error(`❌ Failed to remove synced action ${result.actionId}:`, error);
            }
        }
        for (const result of failed) {
            try {
                const pendingActions = await indexedDBService_1.indexedDBService.getPendingActions();
                const action = pendingActions.find(a => a.id === result.actionId);
                if (action) {
                    const newRetryCount = action.retryCount + 1;
                    if (newRetryCount >= action.maxRetries) {
                        console.log(`🚫 Action ${result.actionId} exceeded max retries, removing`);
                        await indexedDBService_1.indexedDBService.removeOfflineAction(result.actionId);
                    }
                    else {
                        console.log(`🔄 Incrementing retry count for action ${result.actionId}: ${newRetryCount}/${action.maxRetries}`);
                        await indexedDBService_1.indexedDBService.updateOfflineActionRetryCount(result.actionId, newRetryCount);
                    }
                }
            }
            catch (error) {
                console.error(`❌ Failed to update retry count for action ${result.actionId}:`, error);
            }
        }
    }
    async queueOfflineAction(type, data) {
        try {
            await indexedDBService_1.indexedDBService.addOfflineAction({
                type,
                data,
                maxRetries: 3
            });
            console.log(`📝 Queued offline action: ${type}`);
            if (this.isOnline) {
                await this.triggerSync();
            }
        }
        catch (error) {
            console.error('❌ Failed to queue offline action:', error);
            throw error;
        }
    }
    async getSyncStatus() {
        const pendingActions = await indexedDBService_1.indexedDBService.getPendingActions();
        return {
            isOnline: this.isOnline,
            syncInProgress: this.syncInProgress,
            pendingActions: pendingActions.length,
            lastSyncTime: undefined
        };
    }
}
exports.backgroundSyncService = new BackgroundSyncService();
//# sourceMappingURL=backgroundSyncService.js.map