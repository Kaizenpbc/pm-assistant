import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiService } from '../../../services/apiService';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    })),
  },
}));

describe('apiService', () => {
  let mockAxios: any;

  beforeEach(() => {
    mockAxios = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    // Mock the axios instance
    vi.mocked(require('axios').default.create).mockReturnValue(mockAxios);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getProjects', () => {
    it('should fetch projects successfully', async () => {
      const mockProjects = [
        { id: 1, name: 'Test Project 1' },
        { id: 2, name: 'Test Project 2' },
      ];

      mockAxios.get.mockResolvedValue({ data: mockProjects });

      const result = await apiService.getProjects();

      expect(mockAxios.get).toHaveBeenCalledWith('/projects');
      expect(result).toEqual(mockProjects);
    });

    it('should handle API errors', async () => {
      const errorMessage = 'Failed to fetch projects';
      mockAxios.get.mockRejectedValue(new Error(errorMessage));

      await expect(apiService.getProjects()).rejects.toThrow(errorMessage);
    });
  });

  describe('createProject', () => {
    it('should create project successfully', async () => {
      const projectData = {
        name: 'New Project',
        description: 'Project description',
      };

      const mockResponse = { id: 3, ...projectData };
      mockAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await apiService.createProject(projectData);

      expect(mockAxios.post).toHaveBeenCalledWith('/projects', projectData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle validation errors', async () => {
      const invalidData = { name: '' }; // Invalid data
      mockAxios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Validation failed' },
        },
      });

      await expect(apiService.createProject(invalidData)).rejects.toThrow();
    });
  });

  describe('getSchedules', () => {
    it('should fetch schedules for a project', async () => {
      const projectId = 1;
      const mockSchedules = [
        { id: 'schedule-1', projectId, name: 'Test Schedule' },
      ];

      mockAxios.get.mockResolvedValue({ data: mockSchedules });

      const result = await apiService.getSchedules(projectId);

      expect(mockAxios.get).toHaveBeenCalledWith(`/schedules/project/${projectId}`);
      expect(result).toEqual(mockSchedules);
    });
  });

  describe('createSchedule', () => {
    it('should create schedule successfully', async () => {
      const scheduleData = {
        projectId: 1,
        name: 'New Schedule',
        description: 'Schedule description',
      };

      const mockResponse = { id: 'new-schedule', ...scheduleData };
      mockAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await apiService.createSchedule(scheduleData);

      expect(mockAxios.post).toHaveBeenCalledWith('/schedules', scheduleData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getTasks', () => {
    it('should fetch tasks for a schedule', async () => {
      const scheduleId = 'schedule-1';
      const mockTasks = [
        { id: 'task-1', scheduleId, name: 'Test Task' },
      ];

      mockAxios.get.mockResolvedValue({ data: mockTasks });

      const result = await apiService.getTasks(scheduleId);

      expect(mockAxios.get).toHaveBeenCalledWith(`/schedules/${scheduleId}/tasks`);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('createTask', () => {
    it('should create task successfully', async () => {
      const scheduleId = 'schedule-1';
      const taskData = {
        name: 'New Task',
        description: 'Task description',
        priority: 'high',
      };

      const mockResponse = { id: 'new-task', scheduleId, ...taskData };
      mockAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await apiService.createTask(scheduleId, taskData);

      expect(mockAxios.post).toHaveBeenCalledWith(`/schedules/${scheduleId}/tasks`, taskData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('aiTaskBreakdown', () => {
    it('should generate AI task breakdown successfully', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Project description',
        type: 'construction',
      };

      const mockResponse = {
        success: true,
        phases: [
          {
            name: 'Planning Phase',
            tasks: [
              {
                name: 'Project Planning',
                description: 'Create detailed project plan',
                estimatedDuration: 16,
                priority: 'high',
              },
            ],
          },
        ],
      };

      mockAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await apiService.aiTaskBreakdown(projectData);

      expect(mockAxios.post).toHaveBeenCalledWith('/ai-scheduling/breakdown', projectData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle AI service errors', async () => {
      const projectData = { name: 'Test Project' };
      mockAxios.post.mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'AI service unavailable' },
        },
      });

      await expect(apiService.aiTaskBreakdown(projectData)).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(apiService.getProjects()).rejects.toThrow('Network Error');
    });

    it('should handle timeout errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('timeout of 5000ms exceeded'));

      await expect(apiService.getProjects()).rejects.toThrow('timeout of 5000ms exceeded');
    });

    it('should handle 401 unauthorized errors', async () => {
      mockAxios.get.mockRejectedValue({
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      });

      await expect(apiService.getProjects()).rejects.toThrow();
    });

    it('should handle 500 server errors', async () => {
      mockAxios.get.mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      });

      await expect(apiService.getProjects()).rejects.toThrow();
    });
  });
});
