"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineApiService = void 0;
const api_1 = require("./api");
const backgroundSyncService_1 = require("./backgroundSyncService");
class OfflineApiService {
    isOnline = navigator.onLine;
    constructor() {
        this.setupOnlineStatusListener();
    }
    setupOnlineStatusListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Network connection restored - triggering sync');
            backgroundSyncService_1.backgroundSyncService.triggerSync();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Network connection lost - switching to offline mode');
        });
    }
    async executeOrQueue(apiCall, actionType, actionData) {
        if (this.isOnline) {
            try {
                return await apiCall();
            }
            catch (error) {
                console.log(`📝 API call failed, queuing for retry: ${actionType}`);
                await backgroundSyncService_1.backgroundSyncService.queueOfflineAction(actionType, actionData);
                throw error;
            }
        }
        else {
            console.log(`📝 Queuing offline action: ${actionType}`);
            await backgroundSyncService_1.backgroundSyncService.queueOfflineAction(actionType, actionData);
            throw new Error('Operation queued for offline sync');
        }
    }
    async createProject(projectData) {
        return this.executeOrQueue(() => api_1.apiService.createProject(projectData), 'CREATE_PROJECT', projectData);
    }
    async updateProject(projectId, projectData) {
        return this.executeOrQueue(() => api_1.apiService.updateProject(projectId, projectData), 'UPDATE_PROJECT', { id: projectId, ...projectData });
    }
    async createSchedule(scheduleData) {
        return this.executeOrQueue(() => api_1.apiService.createSchedule(scheduleData), 'CREATE_SCHEDULE', scheduleData);
    }
    async updateSchedule(scheduleId, scheduleData) {
        return this.executeOrQueue(() => api_1.apiService.updateSchedule(scheduleId, scheduleData), 'UPDATE_SCHEDULE', { id: scheduleId, ...scheduleData });
    }
    async createTask(scheduleId, taskData) {
        return this.executeOrQueue(() => api_1.apiService.createTask(scheduleId, taskData), 'CREATE_TASK', { scheduleId, ...taskData });
    }
    async updateTask(taskId, taskData) {
        return this.executeOrQueue(() => api_1.apiService.updateTask(taskId, taskData), 'UPDATE_TASK', { id: taskId, ...taskData });
    }
    async deleteTask(taskId) {
        return this.executeOrQueue(() => api_1.apiService.deleteTask(taskId), 'DELETE_TASK', { id: taskId });
    }
    async getProjects() {
        return api_1.apiService.getProjects();
    }
    async getProject(projectId) {
        return api_1.apiService.getProject(projectId);
    }
    async getSchedules(projectId) {
        return api_1.apiService.getSchedules(projectId);
    }
    async getSchedule(scheduleId) {
        return api_1.apiService.getSchedule(scheduleId);
    }
    async getTasks(scheduleId) {
        return api_1.apiService.getTasks(scheduleId);
    }
    async login(username, password) {
        return api_1.apiService.login(username, password);
    }
    async logout() {
        return api_1.apiService.logout();
    }
    async getCurrentUser() {
        return api_1.apiService.getCurrentUser();
    }
    isNetworkOnline() {
        return this.isOnline;
    }
    async getSyncStatus() {
        return backgroundSyncService_1.backgroundSyncService.getSyncStatus();
    }
    async triggerSync() {
        return backgroundSyncService_1.backgroundSyncService.triggerSync();
    }
}
exports.offlineApiService = new OfflineApiService();
//# sourceMappingURL=offlineApiService.js.map