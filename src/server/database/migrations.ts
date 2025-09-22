import { databaseService } from './connection';
import { errorLogger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

export interface Migration {
  id: string;
  name: string;
  up: string;
  down: string;
  executed_at?: Date;
}

class MigrationService {
  private migrations: Migration[] = [];
  private migrationsTable = 'schema_migrations';

  constructor() {
    this.loadMigrations();
  }

  private loadMigrations(): void {
    // Load migrations from the schema.sql file
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Create a basic migration from the schema
      this.migrations.push({
        id: '001_initial_schema',
        name: 'Initial Database Schema',
        up: schema,
        down: '-- Rollback not supported for initial schema'
      });
    }
  }

  public async initializeMigrationsTable(): Promise<void> {
    try {
      await databaseService.query(`
        CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Migrations table initialized');
    } catch (error) {
      console.error('❌ Failed to initialize migrations table:', error);
      console.error('Initialize migrations table error:', error);
      throw error;
    }
  }

  public async getExecutedMigrations(): Promise<string[]> {
    try {
      const result = await databaseService.query<{ id: string }>(
        `SELECT id FROM ${this.migrationsTable} ORDER BY executed_at`
      );
      return result.map(row => row.id);
    } catch (error) {
      console.error('Failed to get executed migrations:', error);
      return [];
    }
  }

  public async executeMigration(migration: Migration): Promise<void> {
    try {
      console.log(`🔄 Executing migration: ${migration.name}`);
      
      // Execute the migration
      await databaseService.query(migration.up);
      
      // Record the migration as executed
      await databaseService.query(
        `INSERT INTO ${this.migrationsTable} (id, name) VALUES (?, ?)`,
        [migration.id, migration.name]
      );
      
      console.log(`✅ Migration ${migration.name} executed successfully`);
    } catch (error) {
      console.error(`❌ Failed to execute migration ${migration.name}:`, error);
      console.error(`Migration ${migration.id} error:`, error);
      throw error;
    }
  }

  public async rollbackMigration(migration: Migration): Promise<void> {
    try {
      console.log(`🔄 Rolling back migration: ${migration.name}`);
      
      // Execute the rollback
      if (migration.down && migration.down !== '-- Rollback not supported for initial schema') {
        await databaseService.query(migration.down);
      }
      
      // Remove the migration record
      await databaseService.query(
        `DELETE FROM ${this.migrationsTable} WHERE id = ?`,
        [migration.id]
      );
      
      console.log(`✅ Migration ${migration.name} rolled back successfully`);
    } catch (error) {
      console.error(`❌ Failed to rollback migration ${migration.name}:`, error);
      console.error(`Rollback ${migration.id} error:`, error);
      throw error;
    }
  }

  public async runMigrations(): Promise<void> {
    try {
      console.log('🔄 Starting database migrations...');
      
      // Initialize migrations table
      await this.initializeMigrationsTable();
      
      // Get executed migrations
      const executedMigrations = await this.getExecutedMigrations();
      
      // Get pending migrations
      const pendingMigrations = this.migrations.filter(
        migration => !executedMigrations.includes(migration.id)
      );
      
      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations');
        return;
      }
      
      console.log(`📋 Found ${pendingMigrations.length} pending migrations`);
      
      // Execute pending migrations
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }
      
      console.log('✅ All migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      console.error('Run migrations error:', error);
      throw error;
    }
  }

  public async rollbackAllMigrations(): Promise<void> {
    try {
      console.log('🔄 Rolling back all migrations...');
      
      const executedMigrations = await this.getExecutedMigrations();
      const migrationsToRollback = this.migrations.filter(
        migration => executedMigrations.includes(migration.id)
      ).reverse(); // Rollback in reverse order
      
      for (const migration of migrationsToRollback) {
        await this.rollbackMigration(migration);
      }
      
      console.log('✅ All migrations rolled back successfully');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      console.error('Rollback all migrations error:', error);
      throw error;
    }
  }

  public async getMigrationStatus(): Promise<{
    total: number;
    executed: number;
    pending: number;
    migrations: Array<{
      id: string;
      name: string;
      executed: boolean;
      executed_at?: Date;
    }>;
  }> {
    try {
      const executedMigrations = await this.getExecutedMigrations();
      
      const migrations = this.migrations.map(migration => ({
        id: migration.id,
        name: migration.name,
        executed: executedMigrations.includes(migration.id),
        executed_at: undefined // TODO: Get actual execution time
      }));
      
      return {
        total: this.migrations.length,
        executed: executedMigrations.length,
        pending: this.migrations.length - executedMigrations.length,
        migrations
      };
    } catch (error) {
      console.error('Failed to get migration status:', error);
      return {
        total: 0,
        executed: 0,
        pending: 0,
        migrations: []
      };
    }
  }

  public async seedDatabase(): Promise<void> {
    try {
      console.log('🌱 Seeding database with initial data...');
      
      // Check if admin user exists
      const adminExists = await databaseService.query(
        'SELECT id FROM users WHERE username = ?',
        ['admin']
      );
      
      if (adminExists.length === 0) {
        console.log('Creating default admin user...');
        // The admin user is already created in the schema.sql
      }
      
      // Check if sample projects exist
      const projectsExist = await databaseService.query(
        'SELECT id FROM projects LIMIT 1'
      );
      
      if (projectsExist.length === 0) {
        console.log('Creating sample projects...');
        await this.createSampleProjects();
      }
      
      console.log('✅ Database seeded successfully');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      console.error('Seed database error:', error);
      throw error;
    }
  }

  private async createSampleProjects(): Promise<void> {
    const sampleProjects = [
      {
        id: 'proj-001',
        code: 'AR-001',
        name: 'Anna Regina Infrastructure Development',
        description: 'Comprehensive infrastructure development project for Anna Regina including roads, utilities, and public facilities',
        status: 'active',
        priority: 'high',
        budget_allocated: 5000000,
        budget_spent: 1750000,
        currency: 'USD',
        start_date: '2024-01-15',
        end_date: '2025-12-31',
        project_manager_id: 'admin-001',
        created_by: 'admin-001'
      },
      {
        id: 'proj-002',
        code: 'GT-002',
        name: 'Georgetown Smart City Initiative',
        description: 'Implementation of smart city technologies including IoT sensors, data analytics, and digital governance systems',
        status: 'planning',
        priority: 'high',
        budget_allocated: 8000000,
        budget_spent: 1200000,
        currency: 'USD',
        start_date: '2024-03-01',
        end_date: '2026-06-30',
        project_manager_id: 'admin-001',
        created_by: 'admin-001'
      },
      {
        id: 'proj-003',
        code: 'BR-003',
        name: 'Berbice Agricultural Modernization',
        description: 'Modernization of agricultural practices in Berbice region with focus on sustainable farming and technology integration',
        status: 'active',
        priority: 'medium',
        budget_allocated: 3000000,
        budget_spent: 840000,
        currency: 'USD',
        start_date: '2024-01-01',
        end_date: '2025-08-31',
        project_manager_id: 'admin-001',
        created_by: 'admin-001'
      },
      {
        id: 'proj-004',
        code: 'ES-004',
        name: 'Essequibo Coastal Protection',
        description: 'Coastal protection and climate resilience project for Essequibo region including sea walls and mangrove restoration',
        status: 'planning',
        priority: 'high',
        budget_allocated: 4500000,
        budget_spent: 225000,
        currency: 'USD',
        start_date: '2024-04-01',
        end_date: '2026-03-31',
        project_manager_id: 'admin-001',
        created_by: 'admin-001'
      }
    ];

    for (const project of sampleProjects) {
      await databaseService.query(
        `INSERT INTO projects (
          id, code, name, description, status, priority, budget_allocated, budget_spent, 
          currency, start_date, end_date, project_manager_id, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          project.id, project.code, project.name, project.description, project.status,
          project.priority, project.budget_allocated, project.budget_spent, project.currency,
          project.start_date, project.end_date, project.project_manager_id, project.created_by
        ]
      );
    }
  }
}

// Create singleton instance
export const migrationService = new MigrationService();

export default migrationService;
