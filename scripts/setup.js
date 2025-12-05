#!/usr/bin/env node

/**
 * PM Application v2 - New Environment Setup Script (Cross-Platform)
 * This script sets up a complete development environment from scratch
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const isWindows = os.platform() === 'win32';

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

function checkCommand(command, name) {
  try {
    execSync(`${command} --version`, { stdio: 'pipe' });
    const version = execSync(`${command} --version`, { encoding: 'utf8' }).trim();
    log(`[SUCCESS] ${name} found: ${version}`, 'green');
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  log('\n===============================', 'blue');
  log('PM APPLICATION v2 - NEW ENVIRONMENT SETUP', 'bright');
  log('===============================', 'blue');
  log('This script will set up a complete development environment\n', 'cyan');

  // Check system requirements
  log('===============================', 'blue');
  log('CHECKING SYSTEM REQUIREMENTS', 'bright');
  log('===============================', 'blue');

  log('[INFO] Checking Node.js...', 'cyan');
  if (!checkCommand('node', 'Node.js')) {
    log('[ERROR] Node.js not found - Please install Node.js 18+ and try again', 'red');
    process.exit(1);
  }

  log('[INFO] Checking npm...', 'cyan');
  if (!checkCommand('npm', 'npm')) {
    log('[ERROR] npm not found - Please install npm and try again', 'red');
    process.exit(1);
  }

  log('[INFO] Checking Docker...', 'cyan');
  if (checkCommand('docker', 'Docker')) {
    // Docker found
  } else {
    log('[WARNING] Docker not found - Optional but recommended for database', 'yellow');
  }

  log('[INFO] Checking Git...', 'cyan');
  if (checkCommand('git', 'Git')) {
    // Git found
  } else {
    log('[WARNING] Git not found - Optional but recommended for version control', 'yellow');
  }

  log('[SUCCESS] All required dependencies found!', 'green');

  // Setup environment
  log('\n===============================', 'blue');
  log('SETTING UP ENVIRONMENT', 'bright');
  log('===============================', 'blue');

  if (!fs.existsSync('.env')) {
    log('[INFO] Creating .env file...', 'cyan');
    if (!exec('npm run config:generate-env')) {
      log('[ERROR] Failed to create .env file', 'red');
      process.exit(1);
    }
    log('[SUCCESS] .env file created', 'green');
  } else {
    log('[INFO] .env file already exists', 'cyan');
  }

  log('[INFO] Validating configuration...', 'cyan');
  if (exec('npm run config:validate')) {
    log('[SUCCESS] Configuration validated', 'green');
  } else {
    log('[WARNING] Configuration validation failed', 'yellow');
  }

  // Install dependencies
  log('\n===============================', 'blue');
  log('INSTALLING DEPENDENCIES', 'bright');
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

  // Setup database
  log('\n===============================', 'blue');
  log('SETTING UP DATABASE', 'bright');
  log('===============================', 'blue');

  if (checkCommand('docker', 'Docker')) {
    log('[INFO] Starting MySQL with Docker...', 'cyan');
    if (exec('docker-compose up -d mysql')) {
      log('[SUCCESS] MySQL container started', 'green');
      log('[INFO] Waiting for database to be ready...', 'cyan');
      await new Promise(resolve => setTimeout(resolve, 15000));
    } else {
      log('[WARNING] Failed to start MySQL container', 'yellow');
      log('[WARNING] Please check Docker is running', 'yellow');
    }
  } else {
    log('[WARNING] Docker not found, skipping database setup', 'yellow');
    log('[WARNING] Please install Docker and start MySQL manually', 'yellow');
  }

  // Run tests
  log('\n===============================', 'blue');
  log('RUNNING TESTS', 'bright');
  log('===============================', 'blue');

  log('[INFO] Running configuration validation...', 'cyan');
  if (exec('npm run config:check')) {
    log('[SUCCESS] Configuration check passed', 'green');
  } else {
    log('[WARNING] Configuration check failed', 'yellow');
  }

  // Show next steps
  log('\n===============================', 'blue');
  log('SETUP COMPLETE!', 'bright');
  log('===============================', 'blue');
  log('\n✅ Environment setup completed successfully!', 'green');
  log('\n🚀 Next Steps:', 'cyan');
  log('  1. Start the development servers:', 'cyan');
  log('     npm run dev:simple', 'cyan');
  log('\n  2. Or start services individually:', 'cyan');
  log('     npm run server:dev    # Backend on port 3001', 'cyan');
  log('     npm run client:dev    # Frontend on port 5173', 'cyan');
  log('\n  3. Access the application:', 'cyan');
  log('     🌐 Frontend: http://localhost:5173', 'cyan');
  log('     🔧 Backend: http://localhost:3001', 'cyan');
  log('     🗄️  Database: localhost:3306', 'cyan');
  log('     🔐 Login: test/password', 'cyan');
  log('\n🛠️ Useful Commands:', 'cyan');
  log('  npm run health:script     # Check system health', 'cyan');
  log('  npm run config:validate   # Validate configuration', 'cyan');
  log('  npm run docker:dev        # Start with Docker', 'cyan');
  log('  npm run test              # Run tests', 'cyan');
  log('\n📚 Documentation:', 'cyan');
  log('  README.md                 # Project overview', 'cyan');
  log('  PRODUCT_MANUAL.md         # Complete feature guide', 'cyan');
  log('  SECURITY_GUIDE.md         # Security implementation', 'cyan');
  log('  TESTING_GUIDE.md          # Testing documentation', 'cyan');
  log('\n💡 If you encounter issues, run: npm run recovery', 'yellow');
}

main().catch(error => {
  log(`\n[ERROR] Setup failed: ${error.message}`, 'red');
  process.exit(1);
});

