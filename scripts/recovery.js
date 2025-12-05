#!/usr/bin/env node

/**
 * PM Application v2 - Quick Recovery Script (Cross-Platform)
 * This script performs a complete system reset and recovery
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const isWindows = os.platform() === 'win32';
const isUnix = os.platform() !== 'win32';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    return false;
  }
}

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function main() {
  log('\n===============================', 'blue');
  log('PM APPLICATION v2 - QUICK RECOVERY', 'bright');
  log('===============================', 'blue');
  log('This script will perform a complete system reset and recovery\n', 'cyan');

  // Step 1: Stop all services
  log('===============================', 'blue');
  log('STEP 1: STOPPING ALL SERVICES', 'bright');
  log('===============================', 'blue');

  log('[INFO] Stopping Node.js processes...', 'cyan');
  if (isWindows) {
    exec('taskkill /F /IM node.exe 2>nul || echo "No processes to kill"');
  } else {
    exec('pkill -f node || true');
  }

  log('[INFO] Stopping Docker containers...', 'cyan');
  exec('docker-compose down 2>/dev/null || true');
  exec('docker-compose -f docker-compose.dev.yml down 2>/dev/null || true');
  log('[SUCCESS] Docker containers stopped', 'green');

  // Step 2: Clean up
  log('\n===============================', 'blue');
  log('STEP 2: CLEANING UP', 'bright');
  log('===============================', 'blue');

  const clientNodeModules = path.join('src', 'client', 'node_modules');
  if (fs.existsSync(clientNodeModules)) {
    log('[INFO] Removing client node_modules...', 'cyan');
    fs.rmSync(clientNodeModules, { recursive: true, force: true });
    log('[SUCCESS] Client node_modules removed', 'green');
  }

  const distDir = 'dist';
  if (fs.existsSync(distDir)) {
    log('[INFO] Removing build artifacts...', 'cyan');
    fs.rmSync(distDir, { recursive: true, force: true });
    log('[SUCCESS] Build artifacts removed', 'green');
  }

  const clientDist = path.join('src', 'client', 'dist');
  if (fs.existsSync(clientDist)) {
    log('[INFO] Removing client build artifacts...', 'cyan');
    fs.rmSync(clientDist, { recursive: true, force: true });
    log('[SUCCESS] Client build artifacts removed', 'green');
  }

  // Step 3: Start database
  log('\n===============================', 'blue');
  log('STEP 3: STARTING DATABASE', 'bright');
  log('===============================', 'blue');

  log('[INFO] Starting MySQL with Docker...', 'cyan');
  if (exec('docker-compose up -d mysql')) {
    log('[SUCCESS] MySQL container started', 'green');
    log('[INFO] Waiting for database to be ready...', 'cyan');
    await sleep(10);
  } else {
    log('[WARNING] Failed to start MySQL container', 'yellow');
    log('[WARNING] Please check Docker is running and try again', 'yellow');
  }

  // Step 4: Validate configuration
  log('\n===============================', 'blue');
  log('STEP 4: VALIDATING CONFIGURATION', 'bright');
  log('===============================', 'blue');

  if (fs.existsSync('.env')) {
    log('[INFO] Configuration file found', 'cyan');
    log('[INFO] Validating configuration...', 'cyan');
    if (exec('npm run config:validate')) {
      log('[SUCCESS] Configuration is valid', 'green');
    } else {
      log('[WARNING] Configuration validation failed', 'yellow');
    }
  } else {
    log('[WARNING] .env file not found', 'yellow');
    log('[INFO] Generating new .env file...', 'cyan');
    if (exec('npm run config:generate-env')) {
      log('[SUCCESS] .env file generated', 'green');
    } else {
      log('[ERROR] Failed to generate .env file', 'red');
      process.exit(1);
    }
  }

  // Step 5: Install dependencies
  log('\n===============================', 'blue');
  log('STEP 5: INSTALLING DEPENDENCIES', 'bright');
  log('===============================', 'blue');

  log('[INFO] Installing root dependencies...', 'cyan');
  if (!exec('npm install')) {
    log('[ERROR] Failed to install root dependencies', 'red');
    process.exit(1);
  }
  log('[SUCCESS] Root dependencies installed', 'green');

  const clientPackageJson = path.join('src', 'client', 'package.json');
  if (fs.existsSync(clientPackageJson)) {
    log('[INFO] Installing client dependencies...', 'cyan');
    process.chdir(path.join('src', 'client'));
    if (!exec('npm install')) {
      log('[ERROR] Failed to install client dependencies', 'red');
      process.chdir(path.join('..', '..'));
      process.exit(1);
    }
    process.chdir(path.join('..', '..'));
    log('[SUCCESS] Client dependencies installed', 'green');
  }

  // Step 6: Start services
  log('\n===============================', 'blue');
  log('STEP 6: STARTING SERVICES', 'bright');
  log('===============================', 'blue');

  log('[INFO] Starting backend server...', 'cyan');
  if (isWindows) {
    spawn('cmd', ['/c', 'start', 'PM Backend', 'cmd', '/k', 'npm run server:dev'], {
      detached: true,
      stdio: 'ignore'
    });
  } else {
    spawn('npm', ['run', 'server:dev'], {
      detached: true,
      stdio: 'ignore'
    }).unref();
  }

  log('[INFO] Waiting for backend to be ready...', 'cyan');
  await sleep(15);

  log('[INFO] Starting frontend server...', 'cyan');
  if (isWindows) {
    spawn('cmd', ['/c', 'start', 'PM Frontend', 'cmd', '/k', 'cd src\\client && npm run dev'], {
      detached: true,
      stdio: 'ignore'
    });
  } else {
    const clientDir = path.join('src', 'client');
    spawn('npm', ['run', 'dev'], {
      cwd: clientDir,
      detached: true,
      stdio: 'ignore'
    }).unref();
  }

  log('[INFO] Waiting for frontend to be ready...', 'cyan');
  await sleep(10);

  // Step 7: Health check
  log('\n===============================', 'blue');
  log('STEP 7: FINAL HEALTH CHECK', 'bright');
  log('===============================', 'blue');

  log('[INFO] Running comprehensive health check...', 'cyan');
  exec('npm run health:script');

  log('\n===============================', 'blue');
  log('RECOVERY COMPLETE!', 'bright');
  log('===============================', 'blue');
  log('\n✅ All services are starting up', 'green');
  log('🌐 Frontend: http://localhost:5173', 'cyan');
  log('🔧 Backend: http://localhost:3001', 'cyan');
  log('🗄️  Database: localhost:3306', 'cyan');
  log('🔐 Login: test/password', 'cyan');
  log('\n💡 Check the opened terminal windows for service logs', 'yellow');
}

main().catch(error => {
  log(`\n[ERROR] Recovery failed: ${error.message}`, 'red');
  process.exit(1);
});

