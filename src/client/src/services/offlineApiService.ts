// Offline API Service Integration
// Wraps API calls with offline detection and queuing

import { apiService } from './api';
import { backgroundSyncService } from './backgroundSyncService';

class OfflineApiService {
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.setupOnlineStatusListener();
  }

  private setupOnlineStatusListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Network connection restored - triggering sync');
      backgroundSyncService.triggerSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Network connection lost - switching to offline mode');
    });
  }

  private async executeOrQueue<T>(
    apiCall: () => Promise<T>,
    actionType: string,
    actionData: any
  ): Promise<T> {
    if (this.isOnline) {
      try {
        return await apiCall();
      } catch (error) {
        // If API call fails, queue for retry
        console.log(`📝 API call failed, queuing for retry: ${actionType}`);
        await backgroundSyncService.queueOfflineAction(actionType as any, actionData);
        throw error;
      }
    } else {
      // Queue for offline sync
      console.log(`📝 Queuing offline action: ${actionType}`);
      await backgroundSyncService.queueOfflineAction(actionType as any, actionData);
      
      // Return a mock response or throw an error indicating offline mode
      throw new Error('Operation queued for offline sync');
    }
  }

  // Project Operations
  async createProject(projectData: any) {
    return this.executeOrQueue(
      () => apiService.createProject(projectData),
      'CREATE_PROJECT',
      projectData
    );
  }

  async updateProject(projectId: string, projectData: any) {
    return this.executeOrQueue(
      () => apiService.updateProject(projectId, projectData),
      'UPDATE_PROJECT',
      { id: projectId, ...projectData }
    );
  }

  // Schedule Operations
  async createSchedule(scheduleData: any) {
    return this.executeOrQueue(
      () => apiService.createSchedule(scheduleData),
      'CREATE_SCHEDULE',
      scheduleData
    );
  }

  async updateSchedule(scheduleId: string, scheduleData: any) {
    return this.executeOrQueue(
      () => apiService.updateSchedule(scheduleId, scheduleData),
      'UPDATE_SCHEDULE',
      { id: scheduleId, ...scheduleData }
    );
  }

  // Task Operations
  async createTask(scheduleId: string, taskData: any) {
    return this.executeOrQueue(
      () => apiService.createTask(scheduleId, taskData),
      'CREATE_TASK',
      { scheduleId, ...taskData }
    );
  }

  async updateTask(scheduleId: string, taskId: string, taskData: any) {
    return this.executeOrQueue(
      () => apiService.updateTask(scheduleId, taskId, taskData),
      'UPDATE_TASK',
      { scheduleId, id: taskId, ...taskData }
    );
  }

  async deleteTask(scheduleId: string, taskId: string) {
    return this.executeOrQueue(
      () => apiService.deleteTask(scheduleId, taskId),
      'DELETE_TASK',
      { scheduleId, id: taskId }
    );
  }

  // Read Operations (these don't need offline queuing)
  async getProjects() {
    return apiService.getProjects();
  }

  async getProject(projectId: string) {
    return apiService.getProject(projectId);
  }

  async getSchedules(projectId: string) {
    return apiService.getSchedules(projectId);
  }

  async getTasks(scheduleId: string) {
    return apiService.getTasks(scheduleId);
  }

  // Auth Operations (these don't need offline queuing)
  async login(username: string, password: string) {
    return apiService.login(username, password);
  }

  async logout() {
    return apiService.logout();
  }

  async getCurrentUser() {
    return apiService.getCurrentUser();
  }

  // Utility Methods
  isNetworkOnline(): boolean {
    return this.isOnline;
  }

  async getSyncStatus() {
    return backgroundSyncService.getSyncStatus();
  }

  async triggerSync() {
    return backgroundSyncService.triggerSync();
  }
}

// Export singleton instance
export const offlineApiService = new OfflineApiService();
