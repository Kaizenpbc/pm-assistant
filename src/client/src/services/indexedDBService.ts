// IndexedDB Service for offline data storage
// Handles offline actions, project data, and sync queue

export type OfflineActionType = 'CREATE_PROJECT' | 'UPDATE_PROJECT' | 'CREATE_SCHEDULE' | 'UPDATE_SCHEDULE' | 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK';

interface OfflineAction {
  id: string;
  type: OfflineActionType;
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

class IndexedDBService {
  private dbName = 'PMApplicationDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('❌ Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('offlineActions')) {
          const offlineStore = db.createObjectStore('offlineActions', { keyPath: 'id' });
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
          offlineStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('cachedProjects')) {
          const projectsStore = db.createObjectStore('cachedProjects', { keyPath: 'id' });
          projectsStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        if (!db.objectStoreNames.contains('cachedSchedules')) {
          const schedulesStore = db.createObjectStore('cachedSchedules', { keyPath: 'id' });
          schedulesStore.createIndex('projectId', 'projectId', { unique: false });
          schedulesStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        if (!db.objectStoreNames.contains('cachedTasks')) {
          const tasksStore = db.createObjectStore('cachedTasks', { keyPath: 'id' });
          tasksStore.createIndex('scheduleId', 'scheduleId', { unique: false });
          tasksStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        console.log('✅ IndexedDB schema created');
      };
    });
  }

  // Offline Actions Management
  async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    const offlineAction: OfflineAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3
    };

    const transaction = this.db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    
    return new Promise((resolve, reject) => {
      const request = store.add(offlineAction);
      
      request.onsuccess = () => {
        console.log('✅ Offline action added:', offlineAction.id);
        resolve();
      };
      
      request.onerror = () => {
        console.error('❌ Failed to add offline action:', request.error);
        reject(request.error);
      };
    });
  }

  async getPendingActions(): Promise<OfflineAction[]> {
    if (!this.db) {
      return [];
    }

    const transaction = this.db.transaction(['offlineActions'], 'readonly');
    const store = transaction.objectStore('offlineActions');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const actions = request.result || [];
        console.log(`📋 Found ${actions.length} pending offline actions`);
        resolve(actions);
      };
      
      request.onerror = () => {
        console.error('❌ Failed to get pending actions:', request.error);
        reject(request.error);
      };
    });
  }

  async removeOfflineAction(actionId: string): Promise<void> {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(actionId);
      
      request.onsuccess = () => {
        console.log('✅ Offline action removed:', actionId);
        resolve();
      };
      
      request.onerror = () => {
        console.error('❌ Failed to remove offline action:', request.error);
        reject(request.error);
      };
    });
  }

  async updateOfflineActionRetryCount(actionId: string, newRetryCount: number): Promise<void> {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(actionId);
      
      getRequest.onsuccess = () => {
        const action = getRequest.result;
        if (action) {
          action.retryCount = newRetryCount;
          const putRequest = store.put(action);
          
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Project Caching
  async cacheProject(project: CachedProject): Promise<void> {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction(['cachedProjects'], 'readwrite');
    const store = transaction.objectStore('cachedProjects');
    
    return new Promise((resolve, reject) => {
      const request = store.put(project);
      
      request.onsuccess = () => {
        console.log('✅ Project cached:', project.id);
        resolve();
      };
      
      request.onerror = () => {
        console.error('❌ Failed to cache project:', request.error);
        reject(request.error);
      };
    });
  }

  async getCachedProjects(): Promise<CachedProject[]> {
    if (!this.db) {
      return [];
    }

    const transaction = this.db.transaction(['cachedProjects'], 'readonly');
    const store = transaction.objectStore('cachedProjects');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const projects = request.result || [];
        console.log(`📋 Found ${projects.length} cached projects`);
        resolve(projects);
      };
      
      request.onerror = () => {
        console.error('❌ Failed to get cached projects:', request.error);
        reject(request.error);
      };
    });
  }

  // Schedule Caching
  async cacheSchedule(schedule: CachedSchedule): Promise<void> {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction(['cachedSchedules'], 'readwrite');
    const store = transaction.objectStore('cachedSchedules');
    
    return new Promise((resolve, reject) => {
      const request = store.put(schedule);
      
      request.onsuccess = () => {
        console.log('✅ Schedule cached:', schedule.id);
        resolve();
      };
      
      request.onerror = () => {
        console.error('❌ Failed to cache schedule:', request.error);
        reject(request.error);
      };
    });
  }

  async getCachedSchedules(projectId?: string): Promise<CachedSchedule[]> {
    if (!this.db) {
      return [];
    }

    const transaction = this.db.transaction(['cachedSchedules'], 'readonly');
    const store = transaction.objectStore('cachedSchedules');
    
    return new Promise((resolve, reject) => {
      let request: IDBRequest;
      
      if (projectId) {
        const index = store.index('projectId');
        request = index.getAll(projectId);
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => {
        const schedules = request.result || [];
        console.log(`📋 Found ${schedules.length} cached schedules`);
        resolve(schedules);
      };
      
      request.onerror = () => {
        console.error('❌ Failed to get cached schedules:', request.error);
        reject(request.error);
      };
    });
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    if (!this.db) {
      return;
    }

    const stores = ['offlineActions', 'cachedProjects', 'cachedSchedules', 'cachedTasks'];
    const transaction = this.db.transaction(stores, 'readwrite');
    
    const promises = stores.map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    try {
      await Promise.all(promises);
      console.log('✅ All IndexedDB data cleared');
    } catch (error) {
      console.error('❌ Failed to clear IndexedDB data:', error);
      throw error;
    }
  }

  async getStorageInfo(): Promise<{
    offlineActions: number;
    cachedProjects: number;
    cachedSchedules: number;
    totalSize: number;
  }> {
    if (!this.db) {
      return { offlineActions: 0, cachedProjects: 0, cachedSchedules: 0, totalSize: 0 };
    }

    const [offlineActions, cachedProjects, cachedSchedules] = await Promise.all([
      this.getPendingActions(),
      this.getCachedProjects(),
      this.getCachedSchedules()
    ]);

    return {
      offlineActions: offlineActions.length,
      cachedProjects: cachedProjects.length,
      cachedSchedules: cachedSchedules.length,
      totalSize: 0 // Could implement actual size calculation if needed
    };
  }
}

// Export singleton instance
export const indexedDBService = new IndexedDBService();
