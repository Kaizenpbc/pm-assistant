import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/server/index';

export async function buildApp(): Promise<FastifyInstance> {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  process.env.COOKIE_SECRET = 'test-cookie-secret';
  process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test_db';
  process.env.CORS_ORIGIN = 'http://localhost:3000';

  const app = await buildServer();
  return app;
}

export async function cleanupDatabase(app: FastifyInstance): Promise<void> {
  const mysql = app.mysql;
  
  // Clean up test data in reverse order of dependencies
  await mysql.query('DELETE FROM tasks WHERE schedule_id IN (SELECT id FROM schedules WHERE project_id IN (SELECT id FROM projects WHERE name LIKE "Test%"))');
  await mysql.query('DELETE FROM schedules WHERE project_id IN (SELECT id FROM projects WHERE name LIKE "Test%")');
  await mysql.query('DELETE FROM projects WHERE name LIKE "Test%"');
}

export async function createTestProject(app: FastifyInstance, projectData: any): Promise<any> {
  const mysql = app.mysql;
  
  const [result] = await mysql.query(
    'INSERT INTO projects (name, description, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
    [projectData.name, projectData.description, projectData.status || 'active']
  );

  const projectId = (result as any).insertId;
  
  return {
    id: projectId,
    ...projectData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export async function createTestSchedule(app: FastifyInstance, scheduleData: any): Promise<any> {
  const mysql = app.mysql;
  
  const [result] = await mysql.query(
    'INSERT INTO schedules (id, project_id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
    [scheduleData.id || `test-schedule-${Date.now()}`, scheduleData.projectId, scheduleData.name, scheduleData.description]
  );

  return {
    id: scheduleData.id || `test-schedule-${Date.now()}`,
    ...scheduleData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export async function createTestTask(app: FastifyInstance, taskData: any): Promise<any> {
  const mysql = app.mysql;
  
  const [result] = await mysql.query(
    'INSERT INTO tasks (id, schedule_id, name, description, status, priority, estimated_duration, assigned_to, start_date, end_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
    [
      taskData.id || `test-task-${Date.now()}`,
      taskData.scheduleId,
      taskData.name,
      taskData.description,
      taskData.status || 'pending',
      taskData.priority || 'medium',
      taskData.estimatedDuration || 8,
      taskData.assignedTo || null,
      taskData.startDate || null,
      taskData.endDate || null
    ]
  );

  return {
    id: taskData.id || `test-task-${Date.now()}`,
    ...taskData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
