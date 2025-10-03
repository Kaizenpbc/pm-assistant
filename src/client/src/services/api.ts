import axios, { AxiosInstance, AxiosResponse } from 'axios';

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
}

export const apiService = new ApiService();
