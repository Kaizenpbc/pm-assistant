import { http, HttpResponse } from 'msw';

// Mock API handlers
export const handlers = [
  // Auth endpoints
  http.post('/api/v1/auth/login', () => {
    return HttpResponse.json({
      message: 'Login successful',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'user'
      }
    });
  }),

  http.post('/api/v1/auth/logout', () => {
    return HttpResponse.json({
      message: 'Logout successful'
    });
  }),

  http.get('/api/v1/auth/me', () => {
    return HttpResponse.json({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'user'
    });
  }),

  // Projects endpoints
  http.get('/api/v1/projects', () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Test Project 1',
        description: 'Test project description',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Test Project 2',
        description: 'Another test project',
        status: 'completed',
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z'
      }
    ]);
  }),

  http.post('/api/v1/projects', () => {
    return HttpResponse.json({
      id: 3,
      name: 'New Test Project',
      description: 'New test project description',
      status: 'active',
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-01-03T00:00:00Z'
    });
  }),

  // Schedules endpoints
  http.get('/api/v1/schedules/project/:projectId', () => {
    return HttpResponse.json([
      {
        id: 'schedule-1',
        projectId: 1,
        name: 'Test Schedule',
        description: 'Test schedule description',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ]);
  }),

  http.post('/api/v1/schedules', () => {
    return HttpResponse.json({
      id: 'new-schedule-id',
      projectId: 1,
      name: 'New Schedule',
      description: 'New schedule description',
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-01-03T00:00:00Z'
    });
  }),

  // Tasks endpoints
  http.get('/api/v1/schedules/:scheduleId/tasks', () => {
    return HttpResponse.json([
      {
        id: 'task-1',
        scheduleId: 'schedule-1',
        name: 'Test Task',
        description: 'Test task description',
        status: 'pending',
        priority: 'medium',
        estimatedDuration: 8,
        assignedTo: null,
        startDate: null,
        endDate: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ]);
  }),

  http.post('/api/v1/schedules/:scheduleId/tasks', () => {
    return HttpResponse.json({
      id: 'new-task-id',
      scheduleId: 'schedule-1',
      name: 'New Task',
      description: 'New task description',
      status: 'pending',
      priority: 'high',
      estimatedDuration: 16,
      assignedTo: null,
      startDate: null,
      endDate: null,
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-01-03T00:00:00Z'
    });
  }),

  // AI Scheduling endpoints
  http.post('/api/v1/ai-scheduling/breakdown', () => {
    return HttpResponse.json({
      success: true,
      phases: [
        {
          name: 'Planning Phase',
          tasks: [
            {
              name: 'Project Planning',
              description: 'Create detailed project plan',
              estimatedDuration: 16,
              priority: 'high'
            }
          ]
        }
      ]
    });
  }),

  // Version endpoint
  http.get('/api/v1/version', () => {
    return HttpResponse.json({
      version: 'v1.0.0',
      buildDate: '2025-01-01T00:00:00Z'
    });
  }),

  // Health check
  http.get('/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: '2025-01-01T00:00:00Z'
    });
  })
];
