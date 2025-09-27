"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiService = void 0;
const axios_1 = __importDefault(require("axios"));
class ApiService {
    api;
    constructor() {
        this.api = axios_1.default.create({
            baseURL: 'http://localhost:3001/api/v1',
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.api.interceptors.request.use((config) => {
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
        this.api.interceptors.response.use((response) => {
            return response;
        }, async (error) => {
            const originalRequest = error.config;
            if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
                originalRequest._retry = true;
                try {
                    await this.api.post('/auth/refresh');
                    return this.api(originalRequest);
                }
                catch (refreshError) {
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        });
    }
    async login(username, password) {
        const response = await this.api.post('/auth/login', { username, password });
        return response.data;
    }
    async register(userData) {
        const response = await this.api.post('/auth/register', userData);
        return response.data;
    }
    async logout() {
        const response = await this.api.post('/auth/logout');
        return response.data;
    }
    async getCurrentUser() {
        const response = await this.api.get('/users/me');
        return response.data;
    }
    async getProjects() {
        const response = await this.api.get('/projects');
        return response.data;
    }
    async getProject(id) {
        const response = await this.api.get(`/projects/${id}`);
        return response.data;
    }
    async createProject(projectData) {
        const response = await this.api.post('/projects', projectData);
        return response.data;
    }
    async updateProject(id, projectData) {
        const response = await this.api.put(`/projects/${id}`, projectData);
        return response.data;
    }
    async deleteProject(id) {
        const response = await this.api.delete(`/projects/${id}`);
        return response.data;
    }
    async getSchedules(projectId) {
        const response = await this.api.get(`/schedules/project/${projectId}`);
        return response.data;
    }
    async createSchedule(scheduleData) {
        const response = await this.api.post('/schedules', scheduleData);
        return response.data;
    }
    async updateSchedule(scheduleId, scheduleData) {
        const response = await this.api.put(`/schedules/${scheduleId}`, scheduleData);
        return response.data;
    }
    async getTasks(scheduleId) {
        const response = await this.api.get(`/schedules/${scheduleId}/tasks`);
        return response.data;
    }
    async createTask(scheduleId, taskData) {
        const response = await this.api.post(`/schedules/${scheduleId}/tasks`, taskData);
        return response.data;
    }
    async updateTask(scheduleId, taskId, taskData) {
        const response = await this.api.put(`/schedules/${scheduleId}/tasks/${taskId}`, taskData);
        return response.data;
    }
    async analyzeProject(projectData) {
        const response = await this.api.post('/ai-scheduling/analyze-project', projectData);
        return response.data;
    }
    async suggestDependencies(taskData) {
        const response = await this.api.post('/ai-scheduling/suggest-dependencies', taskData);
        return response.data;
    }
    async optimizeSchedule(optimizationData) {
        const response = await this.api.post('/ai-scheduling/optimize-schedule', optimizationData);
        return response.data;
    }
    async getProjectInsights(projectId) {
        const response = await this.api.get(`/ai-scheduling/insights/${projectId}`);
        return response.data;
    }
    async getProjectHealth(projectId) {
        const response = await this.api.get(`/health/${projectId}`);
        return response.data;
    }
    async calculateHealthScore(healthData) {
        const response = await this.api.post('/health/calculate', healthData);
        return response.data;
    }
}
exports.apiService = new ApiService();
//# sourceMappingURL=api.js.map