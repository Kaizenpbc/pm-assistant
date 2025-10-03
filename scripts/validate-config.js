#!/usr/bin/env node

/**
 * PM Application v2 - Configuration Validation Script
 * 
 * This script validates the configuration without starting the server
 * and provides detailed feedback on any issues.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

class ConfigurationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checks = [];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  addError(message) {
    this.errors.push(message);
  }

  addWarning(message) {
    this.warnings.push(message);
  }

  addCheck(name, status, details = '') {
    this.checks.push({ name, status, details });
  }

  checkFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
      this.addCheck(`File: ${description}`, 'pass', `Found at ${filePath}`);
      return true;
    } else {
      this.addCheck(`File: ${description}`, 'fail', `Missing at ${filePath}`);
      this.addError(`Required file missing: ${filePath}`);
      return false;
    }
  }

  checkEnvironmentVariable(name, required = true, minLength = 1) {
    const value = process.env[name];
    
    if (!value) {
      if (required) {
        this.addCheck(`Environment: ${name}`, 'fail', 'Not set');
        this.addError(`Required environment variable missing: ${name}`);
      } else {
        this.addCheck(`Environment: ${name}`, 'warn', 'Not set (optional)');
        this.addWarning(`Optional environment variable not set: ${name}`);
      }
      return false;
    }

    if (value.length < minLength) {
      this.addCheck(`Environment: ${name}`, 'fail', `Too short (${value.length} < ${minLength})`);
      this.addError(`Environment variable ${name} is too short: ${value.length} < ${minLength}`);
      return false;
    }

    this.addCheck(`Environment: ${name}`, 'pass', `Set (${value.length} chars)`);
    return true;
  }

  checkUrl(url, name) {
    try {
      new URL(url);
      this.addCheck(`URL: ${name}`, 'pass', url);
      return true;
    } catch (error) {
      this.addCheck(`URL: ${name}`, 'fail', `Invalid URL: ${url}`);
      this.addError(`Invalid URL for ${name}: ${url}`);
      return false;
    }
  }

  checkPort(port, name) {
    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      this.addCheck(`Port: ${name}`, 'fail', `Invalid port: ${port}`);
      this.addError(`Invalid port for ${name}: ${port} (must be 1-65535)`);
      return false;
    }
    this.addCheck(`Port: ${name}`, 'pass', port);
    return true;
  }

  checkSecrets() {
    const secrets = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'COOKIE_SECRET'];
    const values = secrets.map(name => process.env[name]).filter(Boolean);
    
    // Check if all secrets are unique
    const uniqueValues = new Set(values);
    if (values.length > 1 && uniqueValues.size !== values.length) {
      this.addCheck('Secret uniqueness', 'fail', 'Some secrets are identical');
      this.addError('Security secrets must be unique (JWT_SECRET, JWT_REFRESH_SECRET, COOKIE_SECRET)');
      return false;
    }
    
    this.addCheck('Secret uniqueness', 'pass', 'All secrets are unique');
    return true;
  }

  checkDatabaseConfig() {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '3306';
    
    this.checkEnvironmentVariable('DB_HOST', false);
    this.checkEnvironmentVariable('DB_USER', false);
    this.checkEnvironmentVariable('DB_PASSWORD', false);
    this.checkEnvironmentVariable('DB_NAME', false);
    this.checkPort(dbPort, 'Database');
    
    return true;
  }

  generateSecureSecrets() {
    this.log('\n🔐 Secure Secret Generation:', 'cyan');
    
    const secrets = [
      { name: 'JWT_SECRET', value: crypto.randomBytes(32).toString('base64') },
      { name: 'JWT_REFRESH_SECRET', value: crypto.randomBytes(32).toString('base64') },
      { name: 'COOKIE_SECRET', value: crypto.randomBytes(32).toString('base64') }
    ];

    secrets.forEach(secret => {
      this.log(`${secret.name}=${secret.value}`, 'green');
    });

    this.log('\n📝 Add these to your .env file:', 'yellow');
    return secrets;
  }

  validate() {
    this.log('🔍 PM Application v2 - Configuration Validation', 'bright');
    this.log('=' .repeat(50), 'blue');

    // Check .env file
    this.checkFileExists('.env', 'Environment Configuration');

    // Check required files
    this.checkFileExists('package.json', 'Package Configuration');
    this.checkFileExists('src/server/config.ts', 'Server Configuration');

    // Check environment variables
    this.log('\n📋 Environment Variables:', 'cyan');
    this.checkEnvironmentVariable('NODE_ENV', false);
    this.checkEnvironmentVariable('PORT', false);
    this.checkEnvironmentVariable('HOST', false);
    this.checkEnvironmentVariable('JWT_SECRET', true, 32);
    this.checkEnvironmentVariable('JWT_REFRESH_SECRET', true, 32);
    this.checkEnvironmentVariable('COOKIE_SECRET', true, 32);
    this.checkEnvironmentVariable('CORS_ORIGIN', false);
    this.checkEnvironmentVariable('LOG_LEVEL', false);

    // Check database configuration
    this.log('\n🗄️ Database Configuration:', 'cyan');
    this.checkDatabaseConfig();

    // Check URLs
    this.log('\n🌐 URL Configuration:', 'cyan');
    const corsOrigin = process.env.CORS_ORIGIN;
    if (corsOrigin) {
      this.checkUrl(corsOrigin, 'CORS_ORIGIN');
    }

    // Check ports
    this.log('\n🔌 Port Configuration:', 'cyan');
    const port = process.env.PORT || '3001';
    this.checkPort(port, 'Server');

    // Check secrets uniqueness
    this.log('\n🔐 Security Configuration:', 'cyan');
    this.checkSecrets();

    return this.generateReport();
  }

  generateReport() {
    this.log('\n' + '=' .repeat(50), 'blue');
    this.log('📊 CONFIGURATION VALIDATION REPORT', 'bright');
    this.log('=' .repeat(50), 'blue');

    // Summary
    const totalChecks = this.checks.length;
    const passedChecks = this.checks.filter(c => c.status === 'pass').length;
    const failedChecks = this.checks.filter(c => c.status === 'fail').length;
    const warnings = this.checks.filter(c => c.status === 'warn').length;

    this.log(`\n📈 Summary:`, 'cyan');
    this.log(`   Total Checks: ${totalChecks}`);
    this.log(`   ✅ Passed: ${colors.green}${passedChecks}${colors.reset}`);
    this.log(`   ❌ Failed: ${colors.red}${failedChecks}${colors.reset}`);
    this.log(`   ⚠️  Warnings: ${colors.yellow}${warnings}${colors.reset}`);

    // Overall status
    let overallStatus;
    if (failedChecks === 0) {
      overallStatus = 'HEALTHY';
      this.log(`\n🎯 Overall Status: ${colors.green}${overallStatus}${colors.reset}`);
    } else if (failedChecks <= 2) {
      overallStatus = 'DEGRADED';
      this.log(`\n🎯 Overall Status: ${colors.yellow}${overallStatus}${colors.reset}`);
    } else {
      overallStatus = 'UNHEALTHY';
      this.log(`\n🎯 Overall Status: ${colors.red}${overallStatus}${colors.reset}`);
    }

    // Detailed results
    this.log('\n📋 Detailed Results:', 'cyan');
    this.checks.forEach(check => {
      const statusIcon = check.status === 'pass' ? '✅' : 
                        check.status === 'warn' ? '⚠️ ' : '❌';
      const statusColor = check.status === 'pass' ? 'green' : 
                         check.status === 'warn' ? 'yellow' : 'red';
      
      this.log(`   ${statusIcon} ${check.name}: ${colors[statusColor]}${check.status.toUpperCase()}${colors.reset}`);
      if (check.details) {
        this.log(`      ${check.details}`);
      }
    });

    // Errors
    if (this.errors.length > 0) {
      this.log('\n❌ Errors:', 'red');
      this.errors.forEach((error, index) => {
        this.log(`   ${index + 1}. ${error}`);
      });
    }

    // Warnings
    if (this.warnings.length > 0) {
      this.log('\n⚠️  Warnings:', 'yellow');
      this.warnings.forEach((warning, index) => {
        this.log(`   ${index + 1}. ${warning}`);
      });
    }

    // Recommendations
    if (failedChecks > 0 || this.errors.length > 0) {
      this.log('\n💡 Recommendations:', 'cyan');
      
      if (this.errors.some(e => e.includes('JWT_SECRET') || e.includes('COOKIE_SECRET'))) {
        this.log('   • Generate secure secrets using: npm run config:generate-secrets');
      }
      
      if (this.errors.some(e => e.includes('missing'))) {
        this.log('   • Create a .env file with required environment variables');
        this.log('   • Copy env.example to .env and fill in the values');
      }
      
      if (this.errors.some(e => e.includes('Invalid'))) {
        this.log('   • Check your .env file for typos in URLs and ports');
      }
    }

    this.log('\n' + '=' .repeat(50), 'blue');
    
    return {
      status: overallStatus,
      totalChecks,
      passedChecks,
      failedChecks,
      warnings: this.warnings.length,
      errors: this.errors,
      isHealthy: failedChecks === 0
    };
  }
}

// Run validation
if (require.main === module) {
  // Load environment variables
  require('dotenv').config();
  
  const validator = new ConfigurationValidator();
  const result = validator.validate();
  
  if (!result.isHealthy) {
    process.exit(1);
  }
}

module.exports = ConfigurationValidator;
