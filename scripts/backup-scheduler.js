#!/usr/bin/env node

/**
 * PM Application v2 - Automated Backup Scheduler
 * 
 * This script provides automated backup scheduling with:
 * - Configurable backup intervals
 * - Retention policies
 * - Email notifications
 * - Backup rotation
 * - Health monitoring
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const cron = require('node-cron');

const execAsync = promisify(exec);

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

class BackupScheduler {
  constructor(options = {}) {
    this.options = {
      // Backup configuration
      schedule: options.schedule || '0 2 * * *', // Daily at 2 AM
      backupTypes: options.backupTypes || ['full'],
      retentionDays: options.retentionDays || 30,
      retentionCount: options.retentionCount || 10,
      
      // Database configuration
      host: options.host || process.env.DB_HOST || 'localhost',
      port: options.port || process.env.DB_PORT || '3306',
      user: options.user || process.env.DB_USER || 'root',
      password: options.password || process.env.DB_PASSWORD || 'rootpassword',
      database: options.database || process.env.DB_NAME || 'pm_application_v2',
      
      // File configuration
      backupDir: options.backupDir || './backups',
      logFile: options.logFile || './backups/backup-scheduler.log',
      
      // Notification configuration
      enableNotifications: options.enableNotifications !== false,
      emailRecipients: options.emailRecipients || [],
      webhookUrl: options.webhookUrl || null,
      
      // Monitoring
      enableHealthChecks: options.enableHealthChecks !== false,
      healthCheckInterval: options.healthCheckInterval || '0 */6 * * *', // Every 6 hours
      
      ...options
    };
    
    this.isRunning = false;
    this.jobs = [];
    this.stats = {
      totalBackups: 0,
      successfulBackups: 0,
      failedBackups: 0,
      lastBackup: null,
      lastError: null
    };
  }

  log(message, color = 'reset') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    console.log(`${colors[color]}${logMessage}${colors.reset}`);
    
    // Write to log file
    this.writeToLogFile(logMessage);
  }

  writeToLogFile(message) {
    try {
      // Ensure log directory exists
      const logDir = path.dirname(this.options.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      // Append to log file
      fs.appendFileSync(this.options.logFile, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  error(message) {
    this.log(`❌ ERROR: ${message}`, 'red');
    this.stats.lastError = { message, timestamp: new Date().toISOString() };
    this.stats.failedBackups++;
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

  async runBackup() {
    if (this.isRunning) {
      this.warning('Backup already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    this.stats.totalBackups++;

    try {
      this.info('Starting scheduled backup...');
      
      // Run backup script
      const backupCommand = `node scripts/backup-database.js ${this.options.backupTypes.join(' ')} --backup-dir ${this.options.backupDir}`;
      const { stdout, stderr } = await execAsync(backupCommand);
      
      if (stderr && !stderr.includes('Warning')) {
        throw new Error(stderr);
      }
      
      this.success('Scheduled backup completed successfully');
      this.stats.successfulBackups++;
      this.stats.lastBackup = {
        timestamp: new Date().toISOString(),
        success: true
      };
      
      // Send success notification
      if (this.options.enableNotifications) {
        await this.sendNotification('Backup Completed Successfully', 'Scheduled backup completed without errors.');
      }
      
      // Cleanup old backups
      await this.cleanupOldBackups();
      
    } catch (error) {
      this.error(`Scheduled backup failed: ${error.message}`);
      this.stats.lastBackup = {
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      };
      
      // Send failure notification
      if (this.options.enableNotifications) {
        await this.sendNotification('Backup Failed', `Scheduled backup failed: ${error.message}`);
      }
    } finally {
      this.isRunning = false;
    }
  }

  async cleanupOldBackups() {
    try {
      this.info('Cleaning up old backups...');
      
      const files = fs.readdirSync(this.options.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith(this.options.database))
        .map(file => ({
          name: file,
          path: path.join(this.options.backupDir, file),
          mtime: fs.statSync(path.join(this.options.backupDir, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);
      
      let deletedCount = 0;
      
      // Delete files older than retention period
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.options.retentionDays);
      
      for (const file of backupFiles) {
        if (file.mtime < cutoffDate) {
          fs.unlinkSync(file.path);
          deletedCount++;
          this.info(`Deleted old backup: ${file.name}`);
        }
      }
      
      // Keep only the most recent N backups
      const filesToKeep = backupFiles.slice(0, this.options.retentionCount);
      const filesToDelete = backupFiles.slice(this.options.retentionCount);
      
      for (const file of filesToDelete) {
        if (file.mtime >= cutoffDate) { // Only delete if not already deleted by date
          fs.unlinkSync(file.path);
          deletedCount++;
          this.info(`Deleted excess backup: ${file.name}`);
        }
      }
      
      if (deletedCount > 0) {
        this.success(`Cleanup completed. Deleted ${deletedCount} old backup(s).`);
      } else {
        this.info('No old backups to clean up.');
      }
      
    } catch (error) {
      this.warning(`Backup cleanup failed: ${error.message}`);
    }
  }

  async performHealthCheck() {
    try {
      this.info('Performing health check...');
      
      // Test database connection
      const testCommand = `mysql -h ${this.options.host} -P ${this.options.port} -u ${this.options.user} -p${this.options.password} -e "SELECT 1;"`;
      await execAsync(testCommand);
      
      // Check backup directory
      if (!fs.existsSync(this.options.backupDir)) {
        throw new Error('Backup directory does not exist');
      }
      
      // Check disk space
      const { stdout } = await execAsync(`df -h ${this.options.backupDir}`);
      this.info(`Disk space: ${stdout.split('\n')[1]}`);
      
      this.success('Health check passed');
      return true;
      
    } catch (error) {
      this.error(`Health check failed: ${error.message}`);
      
      // Send health check failure notification
      if (this.options.enableNotifications) {
        await this.sendNotification('Health Check Failed', `System health check failed: ${error.message}`);
      }
      
      return false;
    }
  }

  async sendNotification(subject, message) {
    try {
      const notification = {
        timestamp: new Date().toISOString(),
        subject,
        message,
        stats: this.stats
      };
      
      // Send webhook notification
      if (this.options.webhookUrl) {
        const https = require('https');
        const url = require('url');
        
        const parsedUrl = url.parse(this.options.webhookUrl);
        const postData = JSON.stringify(notification);
        
        const options = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || 443,
          path: parsedUrl.path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };
        
        await new Promise((resolve, reject) => {
          const req = https.request(options, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve();
            } else {
              reject(new Error(`Webhook failed with status: ${res.statusCode}`));
            }
          });
          
          req.on('error', reject);
          req.write(postData);
          req.end();
        });
        
        this.info('Webhook notification sent');
      }
      
      // Log notification
      this.info(`Notification: ${subject} - ${message}`);
      
    } catch (error) {
      this.warning(`Failed to send notification: ${error.message}`);
    }
  }

  start() {
    this.info('Starting backup scheduler...');
    this.info(`Schedule: ${this.options.schedule}`);
    this.info(`Backup types: ${this.options.backupTypes.join(', ')}`);
    this.info(`Retention: ${this.options.retentionDays} days or ${this.options.retentionCount} files`);
    this.info(`Backup directory: ${this.options.backupDir}`);
    
    // Validate cron expression
    if (!cron.validate(this.options.schedule)) {
      this.error(`Invalid cron schedule: ${this.options.schedule}`);
      return false;
    }
    
    // Schedule backup job
    const backupJob = cron.schedule(this.options.schedule, async () => {
      await this.runBackup();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });
    
    this.jobs.push(backupJob);
    
    // Schedule health check job
    if (this.options.enableHealthChecks) {
      const healthJob = cron.schedule(this.options.healthCheckInterval, async () => {
        await this.performHealthCheck();
      }, {
        scheduled: true,
        timezone: 'UTC'
      });
      
      this.jobs.push(healthJob);
      this.info(`Health check schedule: ${this.options.healthCheckInterval}`);
    }
    
    this.success('Backup scheduler started successfully');
    return true;
  }

  stop() {
    this.info('Stopping backup scheduler...');
    
    this.jobs.forEach(job => {
      job.destroy();
    });
    
    this.jobs = [];
    this.success('Backup scheduler stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      jobsCount: this.jobs.length,
      stats: this.stats,
      options: {
        schedule: this.options.schedule,
        backupTypes: this.options.backupTypes,
        retentionDays: this.options.retentionDays,
        retentionCount: this.options.retentionCount,
        backupDir: this.options.backupDir
      }
    };
  }

  async runOnce() {
    this.info('Running backup once...');
    await this.runBackup();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};
let command = 'start';

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === 'start') {
    command = 'start';
  } else if (arg === 'stop') {
    command = 'stop';
  } else if (arg === 'status') {
    command = 'status';
  } else if (arg === 'once') {
    command = 'once';
  } else if (arg === '--schedule' && args[i + 1]) {
    options.schedule = args[++i];
  } else if (arg === '--backup-types' && args[i + 1]) {
    options.backupTypes = args[++i].split(',');
  } else if (arg === '--retention-days' && args[i + 1]) {
    options.retentionDays = parseInt(args[++i]);
  } else if (arg === '--retention-count' && args[i + 1]) {
    options.retentionCount = parseInt(args[++i]);
  } else if (arg === '--backup-dir' && args[i + 1]) {
    options.backupDir = args[++i];
  } else if (arg === '--webhook-url' && args[i + 1]) {
    options.webhookUrl = args[++i];
  } else if (arg === '--no-notifications') {
    options.enableNotifications = false;
  } else if (arg === '--no-health-checks') {
    options.enableHealthChecks = false;
  } else if (arg === '--help') {
    console.log(`
Backup Scheduler Usage:

node scripts/backup-scheduler.js [command] [options]

Commands:
  start                 Start the backup scheduler (default)
  stop                  Stop the backup scheduler
  status                Show scheduler status
  once                  Run backup once and exit

Options:
  --schedule CRON       Cron schedule (default: "0 2 * * *")
  --backup-types TYPES  Comma-separated backup types (default: "full")
  --retention-days DAYS Days to keep backups (default: 30)
  --retention-count NUM Max number of backups to keep (default: 10)
  --backup-dir DIR      Backup directory (default: ./backups)
  --webhook-url URL     Webhook URL for notifications
  --no-notifications    Disable notifications
  --no-health-checks    Disable health checks
  --help                Show this help

Examples:
  node scripts/backup-scheduler.js start
  node scripts/backup-scheduler.js --schedule "0 1 * * *" --retention-days 7
  node scripts/backup-scheduler.js once
  node scripts/backup-scheduler.js status
`);
    process.exit(0);
  }
}

// Create scheduler instance
const scheduler = new BackupScheduler(options);

// Handle process signals
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, stopping scheduler...');
  scheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, stopping scheduler...');
  scheduler.stop();
  process.exit(0);
});

// Execute command
switch (command) {
  case 'start':
    scheduler.start();
    break;
  case 'stop':
    scheduler.stop();
    break;
  case 'status':
    console.log('Backup Scheduler Status:');
    console.log(JSON.stringify(scheduler.getStatus(), null, 2));
    break;
  case 'once':
    scheduler.runOnce()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Backup failed:', error);
        process.exit(1);
      });
    break;
  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}
