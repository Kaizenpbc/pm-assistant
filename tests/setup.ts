import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';

// Mock environment variables (must be set BEFORE any config module imports)
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-must-be-at-least-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-must-be-at-least-32-chars';
process.env.COOKIE_SECRET = 'test-cookie-secret-must-be-at-least-32-chars-x';
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test_db';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// Gracefully load MSW if available; skip if not installed
let server: any = null;
try {
  const mocks = await import('./mocks/server');
  server = mocks.server;
} catch {
  // MSW is not installed at the root level -- skip mock server setup.
  // Unit tests that need request mocking should use vi.mock() directly.
}

if (server) {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });
}
