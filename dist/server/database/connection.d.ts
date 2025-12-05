import mysql from 'mysql2/promise';
export interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    waitForConnections: boolean;
    connectionLimit: number;
    queueLimit: number;
    acquireTimeout: number;
    timeout: number;
    reconnect: boolean;
}
declare class DatabaseService {
    private pool;
    private isConnected;
    constructor();
    private initializePool;
    getConnection(): Promise<mysql.PoolConnection>;
    query<T = any>(sql: string, params?: any[]): Promise<T[]>;
    transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T>;
    testConnection(): Promise<boolean>;
    getPoolStatus(): Promise<{
        totalConnections: number;
        activeConnections: number;
        idleConnections: number;
        queuedRequests: number;
    }>;
    close(): Promise<void>;
    isHealthy(): boolean;
}
export declare const databaseService: DatabaseService;
export default databaseService;
//# sourceMappingURL=connection.d.ts.map