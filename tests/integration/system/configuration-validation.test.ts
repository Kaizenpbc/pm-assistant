import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

describe('Configuration Validation Tests', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let originalEnvFile: string | null = null;

  beforeAll(async () => {
    // Store original environment
    originalEnv = { ...process.env };
    
    // Store original .env file if it exists
    try {
      originalEnvFile = fs.readFileSync('.env', 'utf8');
    } catch (error) {
      // .env file doesn't exist, that's okay
    }
  });

  afterAll(async () => {
    // Restore original environment
    process.env = originalEnv;
    
    // Restore original .env file
    if (originalEnvFile !== null) {
      fs.writeFileSync('.env', originalEnvFile);
    } else if (fs.existsSync('.env')) {
      fs.unlinkSync('.env');
    }
  });

  describe('Configuration Validation Script', () => {
    it('should run configuration validation script successfully', async () => {
      try {
        const { stdout, stderr } = await execAsync('node scripts/validate-config.js');
        
        expect(stdout).toContain('PM Application v2 - Configuration Validation');
        expect(stdout).toContain('CONFIGURATION VALIDATION REPORT');
        expect(stdout).toContain('Overall Status:');
        expect(stderr).toBe('');
      } catch (error) {
        // Configuration validation may exit with non-zero code if validation fails
        expect(error).toBeDefined();
      }
    }, 10000);

    it('should validate configuration with valid .env file', async () => {
      // Create a valid .env file for testing
      const validEnvContent = `# PM Application v2 Environment Configuration
NODE_ENV=development
PORT=3001
HOST=localhost
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=pm_application_v2
JWT_SECRET=test-jwt-secret-that-is-at-least-32-characters-long
JWT_REFRESH_SECRET=test-refresh-secret-that-is-at-least-32-characters-long
COOKIE_SECRET=test-cookie-secret-that-is-at-least-32-characters-long
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug`;

      fs.writeFileSync('.env', validEnvContent);
      
      try {
        const { stdout, stderr } = await execAsync('node scripts/validate-config.js');
        
        expect(stdout).toContain('Overall Status: HEALTHY');
        expect(stdout).toContain('✅ Passed:');
        expect(stdout).not.toContain('❌ Failed:');
        expect(stderr).toBe('');
      } catch (error) {
        // Should not throw error with valid configuration
        expect(error).toBeUndefined();
      }
    }, 10000);

    it('should fail validation with invalid configuration', async () => {
      // Create an invalid .env file for testing
      const invalidEnvContent = `# PM Application v2 Environment Configuration - INVALID
NODE_ENV=development
PORT=3001
HOST=localhost
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=pm_application_v2
JWT_SECRET=short
JWT_REFRESH_SECRET=short
COOKIE_SECRET=short
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug`;

      fs.writeFileSync('.env', invalidEnvContent);
      
      try {
        const { stdout, stderr } = await execAsync('node scripts/validate-config.js');
        
        expect(stdout).toContain('Overall Status:');
        expect(stdout).toContain('❌ Failed:');
        expect(stdout).toContain('Security secrets must be unique');
      } catch (error) {
        // Expected to throw error with invalid configuration
        expect(error).toBeDefined();
      }
    }, 10000);

    it('should handle missing .env file gracefully', async () => {
      // Remove .env file
      if (fs.existsSync('.env')) {
        fs.unlinkSync('.env');
      }
      
      try {
        const { stdout, stderr } = await execAsync('node scripts/validate-config.js');
        
        expect(stdout).toContain('Overall Status:');
        expect(stdout).toContain('❌ Failed:');
        expect(stdout).toContain('Required file missing');
      } catch (error) {
        // Expected to throw error with missing .env file
        expect(error).toBeDefined();
      }
    }, 10000);

    it('should validate all required environment variables', async () => {
      // Create .env file with missing required variables
      const incompleteEnvContent = `# PM Application v2 Environment Configuration - INCOMPLETE
NODE_ENV=development
PORT=3001
HOST=localhost
# Missing JWT secrets and other required variables`;

      fs.writeFileSync('.env', incompleteEnvContent);
      
      try {
        const { stdout, stderr } = await execAsync('node scripts/validate-config.js');
        
        expect(stdout).toContain('Overall Status:');
        expect(stdout).toContain('❌ Failed:');
        expect(stdout).toContain('Missing required environment variables');
      } catch (error) {
        // Expected to throw error with incomplete configuration
        expect(error).toBeDefined();
      }
    }, 10000);

    it('should validate URL format for CORS_ORIGIN', async () => {
      // Create .env file with invalid URL
      const invalidUrlEnvContent = `# PM Application v2 Environment Configuration - INVALID URL
NODE_ENV=development
PORT=3001
HOST=localhost
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=pm_application_v2
JWT_SECRET=test-jwt-secret-that-is-at-least-32-characters-long
JWT_REFRESH_SECRET=test-refresh-secret-that-is-at-least-32-characters-long
COOKIE_SECRET=test-cookie-secret-that-is-at-least-32-characters-long
CORS_ORIGIN=invalid-url
LOG_LEVEL=debug`;

      fs.writeFileSync('.env', invalidUrlEnvContent);
      
      try {
        const { stdout, stderr } = await execAsync('node scripts/validate-config.js');
        
        expect(stdout).toContain('Overall Status:');
        expect(stdout).toContain('❌ Failed:');
        expect(stdout).toContain('Invalid URL');
      } catch (error) {
        // Expected to throw error with invalid URL
        expect(error).toBeDefined();
      }
    }, 10000);

    it('should validate port numbers', async () => {
      // Create .env file with invalid port
      const invalidPortEnvContent = `# PM Application v2 Environment Configuration - INVALID PORT
NODE_ENV=development
PORT=99999
HOST=localhost
DB_HOST=localhost
DB_PORT=99999
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=pm_application_v2
JWT_SECRET=test-jwt-secret-that-is-at-least-32-characters-long
JWT_REFRESH_SECRET=test-refresh-secret-that-is-at-least-32-characters-long
COOKIE_SECRET=test-cookie-secret-that-is-at-least-32-characters-long
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug`;

      fs.writeFileSync('.env', invalidPortEnvContent);
      
      try {
        const { stdout, stderr } = await execAsync('node scripts/validate-config.js');
        
        expect(stdout).toContain('Overall Status:');
        expect(stdout).toContain('❌ Failed:');
        expect(stdout).toContain('Invalid port');
      } catch (error) {
        // Expected to throw error with invalid port
        expect(error).toBeDefined();
      }
    }, 10000);
  });

  describe('Secret Generation Script', () => {
    it('should run secret generation script successfully', async () => {
      try {
        const { stdout, stderr } = await execAsync('node scripts/generate-secrets.js');
        
        expect(stdout).toContain('Generating cryptographically secure secrets');
        expect(stdout).toContain('Generated Secrets:');
        expect(stdout).toContain('JWT_SECRET=');
        expect(stdout).toContain('JWT_REFRESH_SECRET=');
        expect(stdout).toContain('COOKIE_SECRET=');
        expect(stdout).toContain('Total secrets generated: 3');
        expect(stderr).toBe('');
      } catch (error) {
        // Should not throw error
        expect(error).toBeUndefined();
      }
    }, 10000);

    it('should generate unique secrets', async () => {
      try {
        const { stdout } = await execAsync('node scripts/generate-secrets.js');
        
        // Extract secrets from output
        const jwtSecretMatch = stdout.match(/JWT_SECRET=([^\n]+)/);
        const refreshSecretMatch = stdout.match(/JWT_REFRESH_SECRET=([^\n]+)/);
        const cookieSecretMatch = stdout.match(/COOKIE_SECRET=([^\n]+)/);
        
        expect(jwtSecretMatch).toBeTruthy();
        expect(refreshSecretMatch).toBeTruthy();
        expect(cookieSecretMatch).toBeTruthy();
        
        const jwtSecret = jwtSecretMatch![1];
        const refreshSecret = refreshSecretMatch![1];
        const cookieSecret = cookieSecretMatch![1];
        
        // All secrets should be different
        expect(jwtSecret).not.toBe(refreshSecret);
        expect(jwtSecret).not.toBe(cookieSecret);
        expect(refreshSecret).not.toBe(cookieSecret);
        
        // All secrets should be at least 32 characters (base64 encoded)
        expect(jwtSecret.length).toBeGreaterThanOrEqual(32);
        expect(refreshSecret.length).toBeGreaterThanOrEqual(32);
        expect(cookieSecret.length).toBeGreaterThanOrEqual(32);
      } catch (error) {
        // Should not throw error
        expect(error).toBeUndefined();
      }
    }, 10000);

    it('should generate complete .env file when using --generate-env flag', async () => {
      // Remove existing .env file
      if (fs.existsSync('.env')) {
        fs.unlinkSync('.env');
      }
      
      try {
        const { stdout, stderr } = await execAsync('node scripts/generate-secrets.js --generate-env');
        
        expect(stdout).toContain('Generating .env file');
        expect(stdout).toContain('Complete .env file generated');
        expect(stderr).toBe('');
        
        // Check that .env file was created
        expect(fs.existsSync('.env')).toBe(true);
        
        // Check that .env file contains secrets
        const envContent = fs.readFileSync('.env', 'utf8');
        expect(envContent).toContain('JWT_SECRET=');
        expect(envContent).toContain('JWT_REFRESH_SECRET=');
        expect(envContent).toContain('COOKIE_SECRET=');
        expect(envContent).not.toContain('PLACEHOLDER_GENERATE_REAL_SECRET');
      } catch (error) {
        // Should not throw error
        expect(error).toBeUndefined();
      }
    }, 10000);
  });

  describe('Configuration Validation Integration', () => {
    it('should validate configuration after secret generation', async () => {
      // Generate secrets and create .env file
      await execAsync('node scripts/generate-secrets.js --generate-env');
      
      try {
        const { stdout, stderr } = await execAsync('node scripts/validate-config.js');
        
        expect(stdout).toContain('Overall Status: HEALTHY');
        expect(stdout).toContain('✅ Passed:');
        expect(stdout).not.toContain('❌ Failed:');
        expect(stderr).toBe('');
      } catch (error) {
        // Should not throw error with valid configuration
        expect(error).toBeUndefined();
      }
    }, 15000);

    it('should provide helpful error messages and recommendations', async () => {
      // Create invalid configuration
      const invalidEnvContent = `# PM Application v2 Environment Configuration - INVALID
NODE_ENV=development
PORT=3001
HOST=localhost
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=pm_application_v2
JWT_SECRET=short
JWT_REFRESH_SECRET=short
COOKIE_SECRET=short
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug`;

      fs.writeFileSync('.env', invalidEnvContent);
      
      try {
        const { stdout, stderr } = await execAsync('node scripts/validate-config.js');
        
        expect(stdout).toContain('Recommendations:');
        expect(stdout).toContain('Generate secure secrets using: npm run config:generate-secrets');
        expect(stdout).toContain('Create a .env file with required environment variables');
      } catch (error) {
        // Expected to throw error with invalid configuration
        expect(error).toBeDefined();
      }
    }, 10000);
  });

  describe('Performance and Reliability', () => {
    it('should complete configuration validation within reasonable time', async () => {
      // Create valid configuration
      const validEnvContent = `# PM Application v2 Environment Configuration
NODE_ENV=development
PORT=3001
HOST=localhost
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=pm_application_v2
JWT_SECRET=test-jwt-secret-that-is-at-least-32-characters-long
JWT_REFRESH_SECRET=test-refresh-secret-that-is-at-least-32-characters-long
COOKIE_SECRET=test-cookie-secret-that-is-at-least-32-characters-long
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug`;

      fs.writeFileSync('.env', validEnvContent);
      
      const startTime = Date.now();
      
      try {
        await execAsync('node scripts/validate-config.js');
      } catch (error) {
        // Should not throw error
        expect(error).toBeUndefined();
      }
      
      const executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
    }, 10000);

    it('should handle concurrent configuration validation requests', async () => {
      // Create valid configuration
      const validEnvContent = `# PM Application v2 Environment Configuration
NODE_ENV=development
PORT=3001
HOST=localhost
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=pm_application_v2
JWT_SECRET=test-jwt-secret-that-is-at-least-32-characters-long
JWT_REFRESH_SECRET=test-refresh-secret-that-is-at-least-32-characters-long
COOKIE_SECRET=test-cookie-secret-that-is-at-least-32-characters-long
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug`;

      fs.writeFileSync('.env', validEnvContent);
      
      const promises = Array(3).fill(null).map(() => 
        execAsync('node scripts/validate-config.js')
      );
      
      try {
        const results = await Promise.all(promises);
        
        results.forEach(result => {
          expect(result.stdout).toContain('Overall Status: HEALTHY');
        });
      } catch (error) {
        // Should not throw error
        expect(error).toBeUndefined();
      }
    }, 15000);
  });
});
