export interface Migration {
    id: string;
    name: string;
    up: string;
    down: string;
    executed_at?: Date;
}
declare class MigrationService {
    private migrations;
    private migrationsTable;
    constructor();
    private loadMigrations;
    initializeMigrationsTable(): Promise<void>;
    getExecutedMigrations(): Promise<string[]>;
    executeMigration(migration: Migration): Promise<void>;
    rollbackMigration(migration: Migration): Promise<void>;
    runMigrations(): Promise<void>;
    rollbackAllMigrations(): Promise<void>;
    getMigrationStatus(): Promise<{
        total: number;
        executed: number;
        pending: number;
        migrations: Array<{
            id: string;
            name: string;
            executed: boolean;
            executed_at?: Date;
        }>;
    }>;
    seedDatabase(): Promise<void>;
    private createSampleProjects;
}
export declare const migrationService: MigrationService;
export default migrationService;
//# sourceMappingURL=migrations.d.ts.map