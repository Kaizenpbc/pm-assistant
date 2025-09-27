"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = void 0;
const msw_1 = require("msw");
exports.handlers = [
    msw_1.http.post('http://localhost:3001/api/v1/auth/login', () => {
        return msw_1.HttpResponse.json({
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
    msw_1.http.get('http://localhost:3001/api/v1/auth/me', () => {
        return msw_1.HttpResponse.json({
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            fullName: 'Test User',
            role: 'user'
        });
    }),
    msw_1.http.get('http://localhost:3001/api/v1/projects', () => {
        return msw_1.HttpResponse.json([
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
    msw_1.http.get('http://localhost:3001/api/v1/schedules/project/:projectId', () => {
        return msw_1.HttpResponse.json([
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
    msw_1.http.post('http://localhost:3001/api/v1/ai-scheduling/breakdown', () => {
        return msw_1.HttpResponse.json({
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
//# sourceMappingURL=handlers.js.map