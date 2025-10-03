#!/usr/bin/env node

/**
 * PM Application v2 - Database Restore Script
 * 
 * This script restores database from backups including:
 * - Full database restore
 * - Schema-only restore
 * - Data-only restore
 * - Compressed backup support
 * - Safety checks and confirmations
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const zlib = require('zlib');
const { pipeline } = require('stream');
const readline = require('readline');

const execAsync = promisify(exec);
const pipelineAsync = promisify(pipeline);

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

class DatabaseRestore {
  constructor(options = {}) {
    this.options = {
      host: options.host || process.env.DB_HOST || 'localhost',
      port: options.port || process.env.DB_PORT || '3306',
      user: options.user || process.env.DB_USER || 'root',
      password: options.password || process.env.DB_PASSWORD || 'rootpassword',
      database: options.database || process.env.DB_NAME || 'pm_application_v2',
      backupDir: options.backupDir || './backups',
      force: options.force || false,
      ...options
    };
    
    this.errors = [];
    this.warnings = [];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  error(message) {
    this.log(`❌ ERROR: ${message}`, 'red');
    this.errors.push(message);
  }

  success(message) {
    this.log(`✅ ${message}`, 'green');
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  warning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
    this.warnings.push(message);
  }

  async askConfirmation(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(`${question} (y/N): `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  async listAvailableBackups() {
    try {
      if (!fs.existsSync(this.options.backupDir)) {
        this.warning(`Backup directory does not exist: ${this.options.backupDir}`);
        return [];
      }

      const files = fs.readdirSync(this.options.backupDir);
      const backupFiles = files.filter(file => 
        file.startsWith(this.options.database) && (file.endsWith('.sql') || file.endsWith('.sql.gz'))
      ).map(file => {
        const filePath = path.join(this.options.backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: (stats.size / (1024 * 1024)).toFixed(2),
          date: stats.mtime.toISOString(),
          compressed: file.endsWith('.gz')
        };
      }).sort((a, b) => new Date(b.date) - new Date(a.date));

      if (backupFiles.length === 0) {
        this.warning('No backup files found');
        return [];
      }

      this.info(`Found ${backupFiles.length} backup file(s):`);
      backupFiles.forEach((file, index) => {
        const type = this.getBackupType(file.name);
        this.log(`  ${index + 1}. ${file.name} (${file.size} MB) - ${type} - ${file.date}`);
      });

      return backupFiles;
    } catch (error) {
      this.error(`Failed to list backups: ${error.message}`);
      return [];
    }
  }

  getBackupType(filename) {
    if (filename.includes('_full_')) return 'Full';
    if (filename.includes('_schema_')) return 'Schema';
    if (filename.includes('_data_')) return 'Data';
    return 'Unknown';
  }

  async testDatabaseConnection() {
    this.info('Testing database connection...');
    
    try {
      const testCommand = `mysql -h ${this.options.host} -P ${this.options.port} -u ${this.options.user} -p${this.options.password} -e "SELECT 1;"`;
      await execAsync(testCommand);
      this.success('Database connection successful');
      return true;
    } catch (error) {
      this.error(`Database connection failed: ${error.message}`);
      return false;
    }
  }

  async checkDatabaseExists() {
    this.info(`Checking if database '${this.options.database}' exists...`);
    
    try {
      const checkCommand = `mysql -h ${this.options.host} -P ${this.options.port} -u ${this.options.user} -p${this.options.password} -e "SHOW DATABASES LIKE '${this.options.database}';"`;
      const { stdout } = await execAsync(checkCommand);
      
      if (stdout.includes(this.options.database)) {
        this.warning(`Database '${this.options.database}' already exists`);
        return true;
      } else {
        this.info(`Database '${this.options.database}' does not exist`);
        return false;
      }
    } catch (error) {
      this.error(`Failed to check database existence: ${error.message}`);
      return false;
    }
  }

  async createDatabase() {
    this.info(`Creating database '${this.options.database}'...`);
    
    try {
      const createCommand = `mysql -h ${this.options.host} -P ${this.options.port} -u ${this.options.user} -p${this.options.password} -e "CREATE DATABASE IF NOT EXISTS ${this.options.database};"`;
      await execAsync(createCommand);
      this.success(`Database '${this.options.database}' created`);
      return true;
    } catch (error) {
      this.error(`Failed to create database: ${error.message}`);
      return false;
    }
  }

  async backupCurrentDatabase() {
    this.info('Creating backup of current database before restore...');
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `${this.options.database}_pre_restore_${timestamp}.sql.gz`;
      const backupPath = path.join(this.options.backupDir, backupFileName);
      
      const command = `mysqldump -h ${this.options.host} -P ${this.options.port} -u ${this.options.user} -p${this.options.password} --single-transaction --routines --triggers --events --add-drop-database --databases ${this.options.database} | gzip > ${backupPath}`;
      
      await execAsync(command);
      
      const stats = fs.statSync(backupPath);
      const fileSize = (stats.size / (1024 * 1024)).toFixed(2);
      
      this.success(`Pre-restore backup created: ${backupFileName} (${fileSize} MB)`);
      return backupPath;
    } catch (error) {
      this.warning(`Failed to create pre-restore backup: ${error.message}`);
      return null;
    }
  }

  async restoreFromFile(filePath, compressed = false) {
    this.info(`Restoring database from: ${path.basename(filePath)}`);
    
    try {
      let command;
      
      if (compressed) {
        // For compressed files, use gunzip pipe
        command = `gunzip < ${filePath} | mysql -h ${this.options.host} -P ${this.options.port} -u ${this.options.user} -p${this.options.password}`;
      } else {
        // For uncompressed files, direct mysql import
        command = `mysql -h ${this.options.host} -P ${this.options.port} -u ${this.options.user} -p${this.options.password} < ${filePath}`;
      }
      
      await execAsync(command);
      this.success(`Database restored successfully from ${path.basename(filePath)}`);
      return true;
    } catch (error) {
      this.error(`Restore failed: ${error.message}`);
      return false;
    }
  }

  async verifyRestore() {
    this.info('Verifying database restore...');
    
    try {
      // Check if database exists
      const dbExists = await this.checkDatabaseExists();
      if (!dbExists) {
        this.error('Database does not exist after restore');
        return false;
      }
      
      // Check table count
      const tableCheckCommand = `mysql -h ${this.options.host} -P ${this.options.port} -u ${this.options.user} -p${this.options.password} -e "USE ${this.options.database}; SHOW TABLES;"`;
      const { stdout } = await execAsync(tableCheckCommand);
      
      const tables = stdout.split('\n').filter(line => line.trim() && !line.includes('Tables_in'));
      
      if (tables.length === 0) {
        this.warning('No tables found after restore');
      } else {
        this.success(`Found ${tables.length} table(s) after restore`);
      }
      
      // Test basic functionality
      const testCommand = `mysql -h ${this.options.host} -P ${this.options.port} -u ${this.options.user} -p${this.options.password} -e "USE ${this.options.database}; SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = '${this.options.database}';"`;
      const { stdout: testOutput } = await execAsync(testCommand);
      
      this.success('Database restore verification completed');
      return true;
    } catch (error) {
      this.error(`Restore verification failed: ${error.message}`);
      return false;
    }
  }

  async run(backupFile = null) {
    this.log('🗄️  PM Application v2 - Database Restore', 'bright');
    this.log('=' .repeat(50), 'cyan');
    
    const startTime = Date.now();
    
    // Test database connection
    if (!await this.testDatabaseConnection()) {
      return false;
    }
    
    // List available backups if no specific file provided
    let selectedBackup = null;
    if (!backupFile) {
      const availableBackups = await this.listAvailableBackups();
      if (availableBackups.length === 0) {
        this.error('No backup files available for restore');
        return false;
      }
      
      // For interactive mode, let user select
      if (!this.options.force) {
        this.info('\nPlease select a backup file to restore:');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        selectedBackup = await new Promise((resolve) => {
          rl.question(`Enter backup file number (1-${availableBackups.length}): `, (answer) => {
            rl.close();
            const index = parseInt(answer) - 1;
            if (index >= 0 && index < availableBackups.length) {
              resolve(availableBackups[index]);
            } else {
              resolve(null);
            }
          });
        });
        
        if (!selectedBackup) {
          this.error('Invalid backup file selection');
          return false;
        }
      } else {
        // Use the most recent backup
        selectedBackup = availableBackups[0];
        this.info(`Auto-selected most recent backup: ${selectedBackup.name}`);
      }
    } else {
      // Use provided backup file
      const backupPath = path.isAbsolute(backupFile) ? backupFile : path.join(this.options.backupDir, backupFile);
      
      if (!fs.existsSync(backupPath)) {
        this.error(`Backup file not found: ${backupPath}`);
        return false;
      }
      
      const stats = fs.statSync(backupPath);
      selectedBackup = {
        name: path.basename(backupPath),
        path: backupPath,
        size: (stats.size / (1024 * 1024)).toFixed(2),
        date: stats.mtime.toISOString(),
        compressed: path.basename(backupPath).endsWith('.gz')
      };
    }
    
    this.info(`Selected backup: ${selectedBackup.name} (${selectedBackup.size} MB)`);
    
    // Check if database exists
    const dbExists = await this.checkDatabaseExists();
    
    // Safety checks and confirmations
    if (!this.options.force) {
      if (dbExists) {
        this.warning(`Database '${this.options.database}' already exists and will be overwritten!`);
        
        const confirmed = await this.askConfirmation('Are you sure you want to proceed?');
        if (!confirmed) {
          this.info('Restore cancelled by user');
          return false;
        }
        
        // Create backup of current database
        await this.backupCurrentDatabase();
      } else {
        const confirmed = await this.askConfirmation(`Create new database '${this.options.database}' and restore from backup?`);
        if (!confirmed) {
          this.info('Restore cancelled by user');
          return false;
        }
      }
    }
    
    // Create database if it doesn't exist
    if (!dbExists) {
      if (!await this.createDatabase()) {
        return false;
      }
    }
    
    // Perform restore
    const restoreSuccess = await this.restoreFromFile(selectedBackup.path, selectedBackup.compressed);
    
    if (!restoreSuccess) {
      return false;
    }
    
    // Verify restore
    await this.verifyRestore();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Summary
    this.log('\n' + '=' .repeat(50), 'cyan');
    this.log('📊 RESTORE SUMMARY', 'bright');
    this.log('=' .repeat(50), 'cyan');
    
    this.success(`Database restore completed successfully in ${duration} seconds`);
    this.log(`\nRestored from: ${selectedBackup.name}`);
    this.log(`Database: ${this.options.database}`);
    this.log(`File size: ${selectedBackup.size} MB`);
    
    if (this.warnings.length > 0) {
      this.log('\nWarnings:');
      this.warnings.forEach(warning => {
        this.log(`  ⚠️  ${warning}`);
      });
    }
    
    if (this.errors.length > 0) {
      this.log('\nErrors encountered:');
      this.errors.forEach(error => {
        this.log(`  ❌ ${error}`);
      });
    }
    
    this.log('\n💡 Next steps:');
    this.log('  • Test application functionality');
    this.log('  • Verify data integrity');
    this.log('  • Update application if needed');
    this.log('  • Monitor system performance');
    
    return true;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};
let backupFile = null;

// Parse options
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--host' && args[i + 1]) {
    options.host = args[++i];
  } else if (arg === '--port' && args[i + 1]) {
    options.port = args[++i];
  } else if (arg === '--user' && args[i + 1]) {
    options.user = args[++i];
  } else if (arg === '--password' && args[i + 1]) {
    options.password = args[++i];
  } else if (arg === '--database' && args[i + 1]) {
    options.database = args[++i];
  } else if (arg === '--backup-dir' && args[i + 1]) {
    options.backupDir = args[++i];
  } else if (arg === '--force') {
    options.force = true;
  } else if (arg === '--file' && args[i + 1]) {
    backupFile = args[++i];
  } else if (arg === '--help') {
    console.log(`
Database Restore Script Usage:

node scripts/restore-database.js [options] [backup-file]

Options:
  --host HOST          Database host (default: localhost)
  --port PORT          Database port (default: 3306)
  --user USER          Database user (default: root)
  --password PASS      Database password
  --database DB        Database name (default: pm_application_v2)
  --backup-dir DIR     Backup directory (default: ./backups)
  --file FILE          Specific backup file to restore
  --force              Skip confirmations (use with caution!)
  --help               Show this help

Examples:
  node scripts/restore-database.js
  node scripts/restore-database.js --file backup.sql.gz
  node scripts/restore-database.js --force
  node scripts/restore-database.js --backup-dir /backups --force
`);
    process.exit(0);
  } else if (!arg.startsWith('--')) {
    // Non-option argument is treated as backup file
    backupFile = arg;
  }
}

// Run restore
const restore = new DatabaseRestore(options);
restore.run(backupFile)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Restore script failed:', error);
    process.exit(1);
  });
