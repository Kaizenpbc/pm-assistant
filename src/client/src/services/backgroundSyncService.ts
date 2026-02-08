// Background Sync Service for offline data synchronization
// Handles syncing offline actions when connection is restored

import { indexedDBService } from './indexedDBService';
import { apiService } from './api';

interface SyncResult {
  success: boolean;
  actionId: string;
  error?: string;
  retryAfter?: number;
}

class BackgroundSyncService {
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private syncListeners: ((isOnline: boolean) => void)[] = [];

  constructor() {
    this.setupOnlineStatusListener();
  }

  private setupOnlineStatusListener(): void {
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

  private notifyListeners(isOnline: boolean): void {
    this.syncListeners.forEach(listener => {
      try {
        listener(isOnline);
      } catch (error) {
        console.error('❌ Error in sync listener:', error);
      }
    });
  }

  public addSyncListener(listener: (isOnline: boolean) => void): void {
    this.syncListeners.push(listener);
  }

  public removeSyncListener(listener: (isOnline: boolean) => void): void {
    const index = this.syncListeners.indexOf(listener);
    if (index > -1) {
      this.syncListeners.splice(index, 1);
    }
  }

  public isNetworkOnline(): boolean {
    return this.isOnline;
  }

  public async triggerSync(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      console.log('⏸️ Sync skipped - already in progress or offline');
      return;
    }

    this.syncInProgress = true;
    console.log('🔄 Starting background sync...');

    try {
      const pendingActions = await indexedDBService.getPendingActions();
      
      if (pendingActions.length === 0) {
        console.log('✅ No pending actions to sync');
        return;
      }

      console.log(`📋 Syncing ${pendingActions.length} pending actions`);

      const syncResults = await this.syncActions(pendingActions);
      await this.processSyncResults(syncResults);

      console.log('✅ Background sync completed');
    } catch (error) {
      console.error('❌ Background sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncActions(actions: any[]): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const action of actions) {
      try {
        console.log(`🔄 Syncing action: ${action.type} (${action.id})`);
        
        const result = await this.syncAction(action);
        results.push(result);
        
        // Add small delay between requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
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

  private async syncAction(action: any): Promise<SyncResult> {
    try {
      let success = false;
      let error: string | undefined;

      switch (action.type) {
        case 'CREATE_PROJECT':
          try {
            await apiService.createProject(action.data);
            success = true;
          } catch (err: any) {
            error = err.message || 'Failed to create project';
          }
          break;

        case 'UPDATE_PROJECT':
          try {
            await apiService.updateProject(action.data.id, action.data);
            success = true;
          } catch (err: any) {
            error = err.message || 'Failed to update project';
          }
          break;

        case 'CREATE_SCHEDULE':
          try {
            await apiService.createSchedule(action.data);
            success = true;
          } catch (err: any) {
            error = err.message || 'Failed to create schedule';
          }
          break;

        case 'UPDATE_SCHEDULE':
          try {
            await apiService.updateSchedule(action.data.id, action.data);
            success = true;
          } catch (err: any) {
            error = err.message || 'Failed to update schedule';
          }
          break;

        case 'CREATE_TASK':
          try {
            await apiService.createTask(action.data.scheduleId, action.data);
            success = true;
          } catch (err: any) {
            error = err.message || 'Failed to create task';
          }
          break;

        case 'UPDATE_TASK': {
          const { scheduleId, id: taskId, ...taskData } = action.data;
          if (!scheduleId || !taskId) {
            error = 'Missing scheduleId or taskId for UPDATE_TASK';
            break;
          }
          try {
            await apiService.updateTask(scheduleId, taskId, taskData);
            success = true;
          } catch (err: any) {
            error = err.message || 'Failed to update task';
          }
          break;
        }

        case 'DELETE_TASK': {
          const { scheduleId, id: taskId } = action.data;
          if (!scheduleId || !taskId) {
            error = 'Missing scheduleId or taskId for DELETE_TASK';
            break;
          }
          try {
            await apiService.deleteTask(scheduleId, taskId);
            success = true;
          } catch (err: any) {
            error = err.message || 'Failed to delete task';
          }
          break;
        }

        default:
          error = `Unknown action type: ${action.type}`;
      }

      return {
        success,
        actionId: action.id,
        error
      };

    } catch (error) {
      return {
        success: false,
        actionId: action.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async processSyncResults(results: SyncResult[]): Promise<void> {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Successfully synced ${successful.length} actions`);
    
    if (failed.length > 0) {
      console.log(`❌ Failed to sync ${failed.length} actions`);
    }

    // Remove successful actions from IndexedDB
    for (const result of successful) {
      try {
        await indexedDBService.removeOfflineAction(result.actionId);
        console.log(`🗑️ Removed synced action: ${result.actionId}`);
      } catch (error) {
        console.error(`❌ Failed to remove synced action ${result.actionId}:`, error);
      }
    }

    // Update retry counts for failed actions
    for (const result of failed) {
      try {
        const pendingActions = await indexedDBService.getPendingActions();
        const action = pendingActions.find(a => a.id === result.actionId);
        
        if (action) {
          const newRetryCount = action.retryCount + 1;
          
          if (newRetryCount >= action.maxRetries) {
            console.log(`🚫 Action ${result.actionId} exceeded max retries, removing`);
            await indexedDBService.removeOfflineAction(result.actionId);
          } else {
            console.log(`🔄 Incrementing retry count for action ${result.actionId}: ${newRetryCount}/${action.maxRetries}`);
            await indexedDBService.updateOfflineActionRetryCount(result.actionId, newRetryCount);
          }
        }
      } catch (error) {
        console.error(`❌ Failed to update retry count for action ${result.actionId}:`, error);
      }
    }
  }

  public async queueOfflineAction(type: import('./indexedDBService').OfflineActionType, data: any): Promise<void> {
    try {
      await indexedDBService.addOfflineAction({
        type,
        data,
        maxRetries: 3
      });
      
      console.log(`📝 Queued offline action: ${type}`);
      
      // If we're online, try to sync immediately
      if (this.isOnline) {
        await this.triggerSync();
      }
    } catch (error) {
      console.error('❌ Failed to queue offline action:', error);
      throw error;
    }
  }

  public async getSyncStatus(): Promise<{
    isOnline: boolean;
    syncInProgress: boolean;
    pendingActions: number;
    lastSyncTime?: number;
  }> {
    const pendingActions = await indexedDBService.getPendingActions();
    
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      pendingActions: pendingActions.length,
      lastSyncTime: undefined // Could implement last sync time tracking
    };
  }
}

// Export singleton instance
export const backgroundSyncService = new BackgroundSyncService();
