#!/usr/bin/env node

/**
 * PM Application v2 - Health Check Script
 * 
 * This script performs comprehensive health checks on the PM Application
 * and can be used for monitoring, CI/CD, and troubleshooting.
 */

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

// Configuration
const config = {
  backend: {
    host: process.env.BACKEND_HOST || 'localhost',
    port: process.env.BACKEND_PORT || 3001,
    protocol: process.env.BACKEND_PROTOCOL || 'http'
  },
  frontend: {
    host: process.env.FRONTEND_HOST || 'localhost',
    port: process.env.FRONTEND_PORT || 5173,
    protocol: process.env.FRONTEND_PROTOCOL || 'http'
  },
  timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000,
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
  exitOnFailure: process.argv.includes('--exit-on-failure')
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class HealthChecker {
  constructor() {
    this.results = {
      backend: null,
      frontend: null,
      database: null,
      overall: 'unknown'
    };
    this.startTime = performance.now();
  }

  log(message, color = 'reset') {
    if (config.verbose || color !== 'reset') {
      console.log(`${colors[color]}${message}${colors.reset}`);
    }
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: options.method || 'GET',
        timeout: config.timeout,
        headers: {
          'User-Agent': 'PM-Application-Health-Checker/1.0',
          ...options.headers
        }
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  async checkBackend() {
    this.log('🔍 Checking backend health...', 'blue');
    
    try {
      const startTime = performance.now();
      const response = await this.makeRequest(`${config.backend.protocol}://${config.backend.host}:${config.backend.port}/health/basic`);
      const responseTime = performance.now() - startTime;
      
      if (response.statusCode === 200) {
        const healthData = JSON.parse(response.data);
        this.results.backend = {
          status: 'healthy',
          responseTime: responseTime,
          data: healthData
        };
        this.log(`✅ Backend healthy (${responseTime.toFixed(2)}ms)`, 'green');
        
        // Check detailed health
        try {
          const detailedResponse = await this.makeRequest(`${config.backend.protocol}://${config.backend.host}:${config.backend.port}/health/detailed`);
          if (detailedResponse.statusCode === 200) {
            const detailedData = JSON.parse(detailedResponse.data);
            this.results.database = {
              status: detailedData.services.database.status,
              responseTime: detailedData.services.database.responseTime
            };
            this.log(`✅ Database: ${detailedData.services.database.status}`, 'green');
          }
        } catch (detailedError) {
          this.log(`⚠️ Detailed health check failed: ${detailedError.message}`, 'yellow');
        }
        
      } else {
        this.results.backend = {
          status: 'unhealthy',
          responseTime: responseTime,
          error: `HTTP ${response.statusCode}`
        };
        this.log(`❌ Backend unhealthy (HTTP ${response.statusCode})`, 'red');
      }
    } catch (error) {
      this.results.backend = {
        status: 'unhealthy',
        error: error.message
      };
      this.log(`❌ Backend check failed: ${error.message}`, 'red');
    }
  }

  async checkFrontend() {
    this.log('🔍 Checking frontend health...', 'blue');
    
    try {
      const startTime = performance.now();
      const response = await this.makeRequest(`${config.frontend.protocol}://${config.frontend.host}:${config.frontend.port}/`);
      const responseTime = performance.now() - startTime;
      
      if (response.statusCode === 200) {
        this.results.frontend = {
          status: 'healthy',
          responseTime: responseTime
        };
        this.log(`✅ Frontend healthy (${responseTime.toFixed(2)}ms)`, 'green');
      } else {
        this.results.frontend = {
          status: 'unhealthy',
          responseTime: responseTime,
          error: `HTTP ${response.statusCode}`
        };
        this.log(`❌ Frontend unhealthy (HTTP ${response.statusCode})`, 'red');
      }
    } catch (error) {
      this.results.frontend = {
        status: 'unhealthy',
        error: error.message
      };
      this.log(`❌ Frontend check failed: ${error.message}`, 'red');
    }
  }

  determineOverallStatus() {
    const backendHealthy = this.results.backend?.status === 'healthy';
    const frontendHealthy = this.results.frontend?.status === 'healthy';
    const databaseHealthy = this.results.database?.status === 'healthy';

    if (backendHealthy && frontendHealthy && databaseHealthy) {
      this.results.overall = 'healthy';
    } else if (backendHealthy || frontendHealthy) {
      this.results.overall = 'degraded';
    } else {
      this.results.overall = 'unhealthy';
    }
  }

  generateReport() {
    const totalTime = performance.now() - this.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 PM APPLICATION v2 - HEALTH CHECK REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n⏱️  Total check time: ${totalTime.toFixed(2)}ms`);
    console.log(`🕐 Timestamp: ${new Date().toISOString()}`);
    
    // Overall Status
    const statusColor = {
      healthy: 'green',
      degraded: 'yellow',
      unhealthy: 'red'
    }[this.results.overall];
    
    console.log(`\n🎯 Overall Status: ${colors[statusColor]}${this.results.overall.toUpperCase()}${colors.reset}`);
    
    // Backend Status
    console.log('\n🔧 Backend Service:');
    if (this.results.backend) {
      const backendColor = this.results.backend.status === 'healthy' ? 'green' : 'red';
      console.log(`   Status: ${colors[backendColor]}${this.results.backend.status}${colors.reset}`);
      if (this.results.backend.responseTime) {
        console.log(`   Response Time: ${this.results.backend.responseTime.toFixed(2)}ms`);
      }
      if (this.results.backend.error) {
        console.log(`   Error: ${colors.red}${this.results.backend.error}${colors.reset}`);
      }
    } else {
      console.log(`   Status: ${colors.red}not checked${colors.reset}`);
    }
    
    // Frontend Status
    console.log('\n🌐 Frontend Service:');
    if (this.results.frontend) {
      const frontendColor = this.results.frontend.status === 'healthy' ? 'green' : 'red';
      console.log(`   Status: ${colors[frontendColor]}${this.results.frontend.status}${colors.reset}`);
      if (this.results.frontend.responseTime) {
        console.log(`   Response Time: ${this.results.frontend.responseTime.toFixed(2)}ms`);
      }
      if (this.results.frontend.error) {
        console.log(`   Error: ${colors.red}${this.results.frontend.error}${colors.reset}`);
      }
    } else {
      console.log(`   Status: ${colors.red}not checked${colors.reset}`);
    }
    
    // Database Status
    console.log('\n🗄️  Database Service:');
    if (this.results.database) {
      const dbColor = this.results.database.status === 'healthy' ? 'green' : 'red';
      console.log(`   Status: ${colors[dbColor]}${this.results.database.status}${colors.reset}`);
      if (this.results.database.responseTime) {
        console.log(`   Response Time: ${this.results.database.responseTime.toFixed(2)}ms`);
      }
    } else {
      console.log(`   Status: ${colors.yellow}unknown${colors.reset}`);
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Recommendations
    if (this.results.overall !== 'healthy') {
      console.log('\n💡 Recommendations:');
      if (!this.results.backend || this.results.backend.status !== 'healthy') {
        console.log('   • Check if backend server is running: npm run server:dev');
        console.log('   • Verify environment variables in .env file');
        console.log('   • Check database connection');
      }
      if (!this.results.frontend || this.results.frontend.status !== 'healthy') {
        console.log('   • Check if frontend server is running: npm run client:dev');
        console.log('   • Verify frontend dependencies: cd src/client && npm install');
      }
    }
    
    console.log('');
    
    return this.results.overall === 'healthy';
  }

  async run() {
    console.log('🚀 Starting PM Application v2 Health Check...\n');
    
    await this.checkBackend();
    await this.checkFrontend();
    
    this.determineOverallStatus();
    const isHealthy = this.generateReport();
    
    if (!isHealthy && config.exitOnFailure) {
      process.exit(1);
    }
    
    return isHealthy;
  }
}

// Run the health check
if (require.main === module) {
  const checker = new HealthChecker();
  checker.run().catch(error => {
    console.error(`${colors.red}Health check failed: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = HealthChecker;
