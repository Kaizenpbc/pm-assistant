"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrationService = void 0;
const connection_1 = require("./connection");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class MigrationService {
    constructor() {
        this.migrations = [];
        this.migrationsTable = 'schema_migrations';
        this.loadMigrations();
    }
    loadMigrations() {
        const schemaPath = path_1.default.join(__dirname, 'schema.sql');
        if (fs_1.default.existsSync(schemaPath)) {
            const schema = fs_1.default.readFileSync(schemaPath, 'utf8');
            this.migrations.push({
                id: '001_initial_schema',
                name: 'Initial Database Schema',
                up: schema,
                down: '-- Rollback not supported for initial schema'
            });
        }
    }
    async initializeMigrationsTable() {
        try {
            await connection_1.databaseService.query(`
        CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            console.log('✅ Migrations table initialized');
        }
        catch (error) {
            console.error('❌ Failed to initialize migrations table:', error);
            console.error('Initialize migrations table error:', error);
            throw error;
        }
    }
    async getExecutedMigrations() {
        try {
            const result = await connection_1.databaseService.query(`SELECT id FROM ${this.migrationsTable} ORDER BY executed_at`);
            return result.map(row => row.id);
        }
        catch (error) {
            console.error('Failed to get executed migrations:', error);
            return [];
        }
    }
    async executeMigration(migration) {
        try {
            console.log(`🔄 Executing migration: ${migration.name}`);
            await connection_1.databaseService.query(migration.up);
            await connection_1.databaseService.query(`INSERT INTO ${this.migrationsTable} (id, name) VALUES (?, ?)`, [migration.id, migration.name]);
            console.log(`✅ Migration ${migration.name} executed successfully`);
        }
        catch (error) {
            console.error(`❌ Failed to execute migration ${migration.name}:`, error);
            console.error(`Migration ${migration.id} error:`, error);
            throw error;
        }
    }
    async rollbackMigration(migration) {
        try {
            console.log(`🔄 Rolling back migration: ${migration.name}`);
            if (migration.down && migration.down !== '-- Rollback not supported for initial schema') {
                await connection_1.databaseService.query(migration.down);
            }
            await connection_1.databaseService.query(`DELETE FROM ${this.migrationsTable} WHERE id = ?`, [migration.id]);
            console.log(`✅ Migration ${migration.name} rolled back successfully`);
        }
        catch (error) {
            console.error(`❌ Failed to rollback migration ${migration.name}:`, error);
            console.error(`Rollback ${migration.id} error:`, error);
            throw error;
        }
    }
    async runMigrations() {
        try {
            console.log('🔄 Starting database migrations...');
            await this.initializeMigrationsTable();
            const executedMigrations = await this.getExecutedMigrations();
            const pendingMigrations = this.migrations.filter(migration => !executedMigrations.includes(migration.id));
            if (pendingMigrations.length === 0) {
                console.log('✅ No pending migrations');
                return;
            }
            console.log(`📋 Found ${pendingMigrations.length} pending migrations`);
            for (const migration of pendingMigrations) {
                await this.executeMigration(migration);
            }
            console.log('✅ All migrations completed successfully');
        }
        catch (error) {
            console.error('❌ Migration failed:', error);
            console.error('Run migrations error:', error);
            throw error;
        }
    }
    async rollbackAllMigrations() {
        try {
            console.log('🔄 Rolling back all migrations...');
            const executedMigrations = await this.getExecutedMigrations();
            const migrationsToRollback = this.migrations.filter(migration => executedMigrations.includes(migration.id)).reverse();
            for (const migration of migrationsToRollback) {
                await this.rollbackMigration(migration);
            }
            console.log('✅ All migrations rolled back successfully');
        }
        catch (error) {
            console.error('❌ Rollback failed:', error);
            console.error('Rollback all migrations error:', error);
            throw error;
        }
    }
    async getMigrationStatus() {
        try {
            const executedMigrations = await this.getExecutedMigrations();
            const migrations = this.migrations.map(migration => ({
                id: migration.id,
                name: migration.name,
                executed: executedMigrations.includes(migration.id),
                executed_at: undefined
            }));
            return {
                total: this.migrations.length,
                executed: executedMigrations.length,
                pending: this.migrations.length - executedMigrations.length,
                migrations
            };
        }
        catch (error) {
            console.error('Failed to get migration status:', error);
            return {
                total: 0,
                executed: 0,
                pending: 0,
                migrations: []
            };
        }
    }
    async seedDatabase() {
        try {
            console.log('🌱 Seeding database with initial data...');
            const adminExists = await connection_1.databaseService.query('SELECT id FROM users WHERE username = ?', ['admin']);
            if (adminExists.length === 0) {
                console.log('Creating default admin user...');
            }
            const projectsExist = await connection_1.databaseService.query('SELECT id FROM projects LIMIT 1');
            if (projectsExist.length === 0) {
                console.log('Creating sample projects...');
                await this.createSampleProjects();
            }
            console.log('✅ Database seeded successfully');
        }
        catch (error) {
            console.error('❌ Database seeding failed:', error);
            console.error('Seed database error:', error);
            throw error;
        }
    }
    async createSampleProjects() {
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
            await connection_1.databaseService.query(`INSERT INTO projects (
          id, code, name, description, status, priority, budget_allocated, budget_spent, 
          currency, start_date, end_date, project_manager_id, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                project.id, project.code, project.name, project.description, project.status,
                project.priority, project.budget_allocated, project.budget_spent, project.currency,
                project.start_date, project.end_date, project.project_manager_id, project.created_by
            ]);
        }
    }
}
exports.migrationService = new MigrationService();
exports.default = exports.migrationService;
//# sourceMappingURL=migrations.js.map