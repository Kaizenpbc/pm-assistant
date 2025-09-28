// Test server database configuration
module.exports = {
  NODE_ENV: 'test',
  PORT: 3002,
  HOST: 'localhost',
  DB_HOST: 'localhost',
  DB_PORT: 3307,
  DB_USER: 'root',
  DB_PASSWORD: 'rootpassword',
  DB_NAME: 'pm_test_database',
  JWT_SECRET: 'your-super-secret-jwt-key-here-at-least-32-characters',
  JWT_REFRESH_SECRET: 'your-super-secret-refresh-key-here-at-least-32-characters',
  COOKIE_SECRET: 'your-super-secret-cookie-key-here-at-least-32-characters',
  CORS_ORIGIN: 'http://localhost:3000',
  LOG_LEVEL: 'info'
};
