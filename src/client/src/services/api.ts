import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getApiErrorMessage } from './errorService';

export { getApiErrorMessage };

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3001/api/v1',
      withCredentials: true, // Important for HttpOnly cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            await this.api.post('/auth/refresh');
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.api.post('/auth/login', { username, password });
    return response.data;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) {
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

  // Project endpoints
  async getProjects() {
    const userRole = localStorage.getItem('userRole') || 'admin';
    const userId = localStorage.getItem('userId') || 'admin-001';
    
    const response = await this.api.get('/projects', {
      headers: {
        'x-user-role': userRole,
        'x-user-id': userId
      }
    });
    return response.data;
  }

  async getProject(id: string) {
    const response = await this.api.get(`/projects/${id}`);
    return response.data;
  }

  async createProject(projectData: {
    name: string;
    description?: string;
    status?: string;
    priority?: string;
    budgetAllocated?: number;
    startDate?: string;
    endDate?: string;
    assignedPM?: string;
  }) {
    const response = await this.api.post('/projects', {
      ...projectData,
      assignedPM: projectData.assignedPM || null
    });
    return response.data;
  }

  async updateProject(id: string, projectData: any) {
    const response = await this.api.put(`/projects/${id}`, projectData);
    return response.data;
  }

  async deleteProject(id: string) {
    const response = await this.api.delete(`/projects/${id}`);
    return response.data;
  }

  // Schedule endpoints
  async getSchedules(projectId: string) {
    const response = await this.api.get(`/schedules/project/${projectId}`);
    return response.data;
  }

  async createSchedule(scheduleData: {
    projectId: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
  }) {
    const response = await this.api.post('/schedules', scheduleData);
    return response.data;
  }

  async updateSchedule(scheduleId: string, scheduleData: any) {
    const response = await this.api.put(`/schedules/${scheduleId}`, scheduleData);
    return response.data;
  }

  async deleteSchedule(scheduleId: string) {
    const response = await this.api.delete(`/schedules/${scheduleId}`);
    return response.data;
  }

  // Task endpoints
  async getTasks(scheduleId: string) {
    const response = await this.api.get(`/schedules/${scheduleId}/tasks`);
    return response.data;
  }

  async createTask(scheduleId: string, taskData: {
    name: string;
    description?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
    dueDate?: string;
    estimatedDays?: number;
    parentTaskId?: string;
    workEffort?: string;
    dependency?: string;
    risks?: string;
    issues?: string;
    comments?: string;
  }) {
    const response = await this.api.post(`/schedules/${scheduleId}/tasks`, taskData);
    return response.data;
  }

  async updateTask(scheduleId: string, taskId: string, taskData: any) {
    const response = await this.api.put(`/schedules/${scheduleId}/tasks/${taskId}`, taskData);
    return response.data;
  }

  async deleteTask(scheduleId: string, taskId: string) {
    const response = await this.api.delete(`/schedules/${scheduleId}/tasks/${taskId}`);
    return response.data;
  }

  // AI Scheduling endpoints
  async analyzeProject(projectData: {
    projectDescription: string;
    projectType?: string;
    existingTasks?: any[];
  }) {
    const response = await this.api.post('/ai-scheduling/analyze-project', projectData);
    return response.data;
  }

  async suggestDependencies(taskData: {
    tasks: any[];
    projectContext?: string;
  }) {
    const response = await this.api.post('/ai-scheduling/suggest-dependencies', taskData);
    return response.data;
  }

  async optimizeSchedule(optimizationData: {
    scheduleId: string;
    optimizationGoals?: string[];
    constraints?: any;
  }) {
    const response = await this.api.post('/ai-scheduling/optimize-schedule', optimizationData);
    return response.data;
  }

  async getProjectInsights(projectId: string) {
    const response = await this.api.get(`/ai-scheduling/insights/${projectId}`);
    return response.data;
  }

  // AI Chat endpoints
  async sendChatMessage(data: {
    message: string;
    conversationId?: string;
    context?: { type: string; projectId?: string; regionId?: string };
  }) {
    const response = await this.api.post('/ai-chat/message', data);
    return response.data;
  }

  streamChatMessage(data: {
    message: string;
    conversationId?: string;
    context?: { type: string; projectId?: string; regionId?: string };
  }): Promise<Response> {
    // Use native fetch for SSE streaming (axios doesn't support ReadableStream)
    return fetch('http://localhost:3001/api/v1/ai-chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
  }

  async getChatConversations() {
    const response = await this.api.get('/ai-chat/conversations');
    return response.data;
  }

  async getChatConversation(id: string) {
    const response = await this.api.get(`/ai-chat/conversations/${id}`);
    return response.data;
  }

  async deleteChatConversation(id: string) {
    const response = await this.api.delete(`/ai-chat/conversations/${id}`);
    return response.data;
  }

  // Health scoring endpoints
  async getProjectHealth(projectId: string) {
    const response = await this.api.get(`/health/${projectId}`);
    return response.data;
  }

  async calculateHealthScore(healthData: {
    startDate: string;
    endDate: string;
    currentDate?: string;
    budgetAllocated: number;
    budgetSpent: number;
    assignedResources: number;
    requiredResources: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
    completedTasks: number;
    totalTasks: number;
    openIssues: number;
    criticalIssues: number;
    resolvedIssues: number;
  }) {
    const response = await this.api.post('/health/calculate', healthData);
    return response.data;
  }

  // Notices endpoints
  async getNotices(regionId: string) {
    const response = await this.api.get(`/notices/region/${regionId}`);
    return response.data;
  }

  async getAllNotices(regionId: string) {
    const response = await this.api.get(`/notices/region/${regionId}/all`);
    return response.data;
  }

  async createNotice(noticeData: {
    regionId: string;
    title: string;
    content: string;
    category?: string;
    priority?: string;
    expiresAt?: string;
  }) {
    const response = await this.api.post('/notices', noticeData);
    return response.data;
  }

  async updateNotice(noticeId: string, noticeData: any) {
    const response = await this.api.put(`/notices/${noticeId}`, noticeData);
    return response.data;
  }

  async publishNotice(noticeId: string, isPublished: boolean) {
    const response = await this.api.patch(`/notices/${noticeId}/publish`, { isPublished });
    return response.data;
  }

  async deleteNotice(noticeId: string) {
    const response = await this.api.delete(`/notices/${noticeId}`);
    return response.data;
  }

  // Public project endpoints (for citizens)
  async getProjectsByRegion(regionId: string) {
    const response = await this.api.get(`/projects?regionId=${regionId}&public=true`);
    return response.data;
  }

  // Region content section endpoints
  async getRegionContent(regionId: string) {
    const response = await this.api.get(`/region-content/region/${regionId}`);
    return response.data;
  }

  async getAllRegionContent(regionId: string) {
    const response = await this.api.get(`/region-content/region/${regionId}/all`);
    return response.data;
  }

  async getRegionSection(regionId: string, sectionType: string) {
    const response = await this.api.get(`/region-content/region/${regionId}/section/${sectionType}`);
    return response.data;
  }

  async createOrUpdateSection(sectionData: {
    regionId: string;
    sectionType: string;
    title: string;
    content: string;
    displayOrder?: number;
    isVisible?: boolean;
    metadata?: any;
  }) {
    const response = await this.api.post('/region-content', sectionData);
    return response.data;
  }

  async updateSection(sectionId: string, sectionData: any) {
    const response = await this.api.put(`/region-content/${sectionId}`, sectionData);
    return response.data;
  }

  async deleteSection(sectionId: string) {
    const response = await this.api.delete(`/region-content/${sectionId}`);
    return response.data;
  }
}

export const apiService = new ApiService();
