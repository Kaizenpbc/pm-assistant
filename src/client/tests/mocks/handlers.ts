import { http, HttpResponse } from 'msw';

// Mock API handlers for client-side testing
export const handlers = [
  // Auth endpoints
  http.post('http://localhost:3001/api/v1/auth/login', () => {
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

  http.get('http://localhost:3001/api/v1/auth/me', () => {
    return HttpResponse.json({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'user'
    });
  }),

  // Projects endpoints
  http.get('http://localhost:3001/api/v1/projects', () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Test Project 1',
        description: 'Test project description',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ]);
  }),

  // Schedules endpoints
  http.get('http://localhost:3001/api/v1/schedules/project/:projectId', () => {
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

  // AI Scheduling endpoints
  http.post('http://localhost:3001/api/v1/ai-scheduling/breakdown', () => {
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
  })
];
