#!/usr/bin/env node

/**
 * PM Application v2 - Database Backup Script
 * 
 * This script creates comprehensive database backups including:
 * - Full database dump
 * - Schema only backup
 * - Data only backup
 * - Compressed backups
 * - Timestamped backup files
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const zlib = require('zlib');
const { pipeline } = require('stream');

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

class DatabaseBackup {
  constructor(options = {}) {
    this.options = {
      host: options.host || process.env.DB_HOST || 'localhost',
      port: options.port || process.env.DB_PORT || '3306',
      user: options.user || process.env.DB_USER || 'root',
      password: options.password || process.env.DB_PASSWORD || 'rootpassword',
      database: options.database || process.env.DB_NAME || 'pm_application_v2',
      backupDir: options.backupDir || './backups',
      compress: options.compress !== false, // Default to true
      timestamp: options.timestamp !== false, // Default to true
      ...options
    };
    
    this.backupTypes = ['full', 'schema', 'data'];
    this.errors = [];
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
  }

  async createBackupDirectory() {
    try {
      if (!fs.existsSync(this.options.backupDir)) {
        fs.mkdirSync(this.options.backupDir, { recursive: true });
        this.info(`Created backup directory: ${this.options.backupDir}`);
      }
      return true;
    } catch (error) {
      this.error(`Failed to create backup directory: ${error.message}`);
      return false;
    }
  }

  generateBackupFileName(type, timestamp = null) {
    const ts = timestamp || new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = `${this.options.database}_${type}_${ts}`;
    return this.options.compress ? `${baseName}.sql.gz` : `${baseName}.sql`;
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

  async createFullBackup() {
    this.info('Creating full database backup...');
    
    const fileName = this.generateBackupFileName('full');
    const filePath = path.join(this.options.backupDir, fileName);
    
    try {
      let command = `mysqldump -h ${this.options.host} -P ${this.options.port} -u ${this.options.user} -p${this.options.password} --single-transaction --routines --triggers --events --add-drop-database --databases ${this.options.database}`;
      
      if (this.options.compress) {
        // Create compressed backup
        const writeStream = fs.createWriteStream(filePath);
        const gzipStream = zlib.createGzip();
        
        const { stdout } = exec(command);
        
        await pipelineAsync(stdout, gzipStream, writeStream);
      } else {
        // Create uncompressed backup
        command += ` > ${filePath}`;
        await execAsync(command);
      }
      
      const stats = fs.statSync(filePath);
      const fileSize = (stats.size / (1024 * 1024)).toFixed(2);
      
      this.success(`Full backup created: ${fileName} (${fileSize} MB)`);
      return { fileName, filePath, size: fileSize };
    } catch (error) {
      this.error(`Full backup failed: ${error.message}`);
      return null;
    }
  }

  async createSchemaBackup() {
    this.info('Creating schema-only backup...');
    
    const fileName = this.generateBackupFileName('schema');
    const filePath = path.join(this.options.backupDir, fileName);
    
    try {
      let command = `mysqldump -h ${this.options.host} -P ${this.options.port} -u ${this.options.user} -p${this.options.password} --no-data --routines --triggers --events --add-drop-database --databases ${this.options.database}`;
      
      if (this.options.compress) {
        const writeStream = fs.createWriteStream(filePath);
        const gzipStream = zlib.createGzip();
        
        const { stdout } = exec(command);
        
        await pipelineAsync(stdout, gzipStream, writeStream);
      } else {
        command += ` > ${filePath}`;
        await execAsync(command);
      }
      
      const stats = fs.statSync(filePath);
      const fileSize = (stats.size / (1024 * 1024)).toFixed(2);
      
      this.success(`Schema backup created: ${fileName} (${fileSize} MB)`);
      return { fileName, filePath, size: fileSize };
    } catch (error) {
      this.error(`Schema backup failed: ${error.message}`);
      return null;
    }
  }

  async createDataBackup() {
    this.info('Creating data-only backup...');
    
    const fileName = this.generateBackupFileName('data');
    const filePath = path.join(this.options.backupDir, fileName);
    
    try {
      let command = `mysqldump -h ${this.options.host} -P ${this.options.port} -u ${this.options.user} -p${this.options.password} --no-create-info --single-transaction --databases ${this.options.database}`;
      
      if (this.options.compress) {
        const writeStream = fs.createWriteStream(filePath);
        const gzipStream = zlib.createGzip();
        
        const { stdout } = exec(command);
        
        await pipelineAsync(stdout, gzipStream, writeStream);
      } else {
        command += ` > ${filePath}`;
        await execAsync(command);
      }
      
      const stats = fs.statSync(filePath);
      const fileSize = (stats.size / (1024 * 1024)).toFixed(2);
      
      this.success(`Data backup created: ${fileName} (${fileSize} MB)`);
      return { fileName, filePath, size: fileSize };
    } catch (error) {
      this.error(`Data backup failed: ${error.message}`);
      return null;
    }
  }

  async listExistingBackups() {
    try {
      const files = fs.readdirSync(this.options.backupDir);
      const backupFiles = files.filter(file => 
        file.startsWith(this.options.database) && file.endsWith('.sql') || file.endsWith('.sql.gz')
      );
      
      if (backupFiles.length > 0) {
        this.info(`Found ${backupFiles.length} existing backup(s):`);
        backupFiles.forEach(file => {
          const filePath = path.join(this.options.backupDir, file);
          const stats = fs.statSync(filePath);
          const size = (stats.size / (1024 * 1024)).toFixed(2);
          const date = stats.mtime.toISOString();
          this.log(`  📄 ${file} (${size} MB) - ${date}`);
        });
      } else {
        this.info('No existing backups found');
      }
      
      return backupFiles;
    } catch (error) {
      this.warning(`Could not list existing backups: ${error.message}`);
      return [];
    }
  }

  async cleanupOldBackups(keepCount = 10) {
    try {
      const files = fs.readdirSync(this.options.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith(this.options.database))
        .map(file => ({
          name: file,
          path: path.join(this.options.backupDir, file),
          mtime: fs.statSync(path.join(this.options.backupDir, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);
      
      if (backupFiles.length > keepCount) {
        const filesToDelete = backupFiles.slice(keepCount);
        this.info(`Cleaning up ${filesToDelete.length} old backup(s)...`);
        
        filesToDelete.forEach(file => {
          fs.unlinkSync(file.path);
          this.info(`Deleted old backup: ${file.name}`);
        });
        
        this.success(`Cleanup completed. Kept ${keepCount} most recent backups.`);
      } else {
        this.info(`No cleanup needed. Total backups: ${backupFiles.length}`);
      }
    } catch (error) {
      this.warning(`Cleanup failed: ${error.message}`);
    }
  }

  async run(types = ['full']) {
    this.log('🗄️  PM Application v2 - Database Backup', 'bright');
    this.log('=' .repeat(50), 'cyan');
    
    const startTime = Date.now();
    
    // Validate backup types
    const validTypes = types.filter(type => this.backupTypes.includes(type));
    if (validTypes.length === 0) {
      this.error('No valid backup types specified. Valid types: ' + this.backupTypes.join(', '));
      return false;
    }
    
    // Create backup directory
    if (!await this.createBackupDirectory()) {
      return false;
    }
    
    // Test database connection
    if (!await this.testDatabaseConnection()) {
      return false;
    }
    
    // List existing backups
    await this.listExistingBackups();
    
    const results = [];
    
    // Create backups
    for (const type of validTypes) {
      let result = null;
      
      switch (type) {
        case 'full':
          result = await this.createFullBackup();
          break;
        case 'schema':
          result = await this.createSchemaBackup();
          break;
        case 'data':
          result = await this.createDataBackup();
          break;
      }
      
      if (result) {
        results.push(result);
      }
    }
    
    // Cleanup old backups
    await this.cleanupOldBackups();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Summary
    this.log('\n' + '=' .repeat(50), 'cyan');
    this.log('📊 BACKUP SUMMARY', 'bright');
    this.log('=' .repeat(50), 'cyan');
    
    if (results.length > 0) {
      this.success(`Backup completed successfully in ${duration} seconds`);
      this.log('\nCreated backups:');
      results.forEach(result => {
        this.log(`  📄 ${result.fileName} (${result.size} MB)`);
      });
    } else {
      this.error('No backups were created successfully');
    }
    
    if (this.errors.length > 0) {
      this.log('\nErrors encountered:');
      this.errors.forEach(error => {
        this.log(`  ❌ ${error}`);
      });
    }
    
    this.log('\n💡 Next steps:');
    this.log('  • Store backups in a secure location');
    this.log('  • Test restore procedures regularly');
    this.log('  • Consider automated backup scheduling');
    this.log('  • Monitor backup file sizes and cleanup old files');
    
    return results.length > 0;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

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
  } else if (arg === '--no-compress') {
    options.compress = false;
  } else if (arg === '--no-timestamp') {
    options.timestamp = false;
  } else if (arg === '--help') {
    console.log(`
Database Backup Script Usage:

node scripts/backup-database.js [options] [types]

Options:
  --host HOST          Database host (default: localhost)
  --port PORT          Database port (default: 3306)
  --user USER          Database user (default: root)
  --password PASS      Database password
  --database DB        Database name (default: pm_application_v2)
  --backup-dir DIR     Backup directory (default: ./backups)
  --no-compress        Disable compression
  --no-timestamp       Disable timestamp in filename
  --help               Show this help

Types:
  full                 Full database backup (default)
  schema               Schema-only backup
  data                 Data-only backup

Examples:
  node scripts/backup-database.js
  node scripts/backup-database.js full schema
  node scripts/backup-database.js --backup-dir /backups --no-compress
`);
    process.exit(0);
  }
}

// Determine backup types
const types = args.filter(arg => !arg.startsWith('--'));
if (types.length === 0) {
  types.push('full');
}

// Run backup
const backup = new DatabaseBackup(options);
backup.run(types)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Backup script failed:', error);
    process.exit(1);
  });
