import mysql from 'mysql2/promise';
import { config } from '../config';
import { errorLogger } from '../utils/logger';

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

class DatabaseService {
  private pool: mysql.Pool | null = null;
  private isConnected = false;

  constructor() {
    this.initializePool();
  }

  private initializePool(): void {
    try {
      const dbConfig: DatabaseConfig = {
        host: config.DB_HOST,
        port: config.DB_PORT,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
      };

      this.pool = mysql.createPool(dbConfig);
      this.isConnected = true;
      
      console.log('✅ Database connection pool initialized');
    } catch (error) {
      console.error('❌ Failed to initialize database connection pool:', error);
      console.error('Database pool initialization error:', error);
      this.isConnected = false;
    }
  }

  public async getConnection(): Promise<mysql.PoolConnection> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    try {
      const connection = await this.pool.getConnection();
      return connection;
    } catch (error) {
      console.error('Database get connection error:', error);
      throw error;
    }
  }

  public async query<T = any>(
    sql: string, 
    params: any[] = []
  ): Promise<T[]> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows as T[];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  public async transaction<T>(
    callback: (connection: mysql.PoolConnection) => Promise<T>
  ): Promise<T> {
    const connection = await this.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  public async getPoolStatus(): Promise<{
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    queuedRequests: number;
  }> {
    if (!this.pool) {
      return {
        totalConnections: 0,
        activeConnections: 0,
        idleConnections: 0,
        queuedRequests: 0
      };
    }

    return {
      totalConnections: this.pool.pool.config.connectionLimit || 10,
      activeConnections: 0, // These properties are not available in the public API
      idleConnections: 0,
      queuedRequests: 0
    };
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      console.log('Database connection pool closed');
    }
  }

  public isHealthy(): boolean {
    return this.isConnected && this.pool !== null;
  }
}

// Create singleton instance
export const databaseService = new DatabaseService();

export default databaseService;
