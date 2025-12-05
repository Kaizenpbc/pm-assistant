"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseService = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = require("../config");
class DatabaseService {
    pool = null;
    isConnected = false;
    constructor() {
        this.initializePool();
    }
    initializePool() {
        try {
            const dbConfig = {
                host: config_1.config.DB_HOST,
                port: config_1.config.DB_PORT,
                user: config_1.config.DB_USER,
                password: config_1.config.DB_PASSWORD,
                database: config_1.config.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                acquireTimeout: 60000,
                timeout: 60000,
                reconnect: true
            };
            this.pool = promise_1.default.createPool(dbConfig);
            this.isConnected = true;
            console.log('✅ Database connection pool initialized');
        }
        catch (error) {
            console.error('❌ Failed to initialize database connection pool:', error);
            console.error('Database pool initialization error:', error);
            this.isConnected = false;
        }
    }
    async getConnection() {
        if (!this.pool) {
            throw new Error('Database pool not initialized');
        }
        try {
            const connection = await this.pool.getConnection();
            return connection;
        }
        catch (error) {
            console.error('Database get connection error:', error);
            throw error;
        }
    }
    async query(sql, params = []) {
        if (!this.pool) {
            throw new Error('Database pool not initialized');
        }
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        }
        catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }
    async transaction(callback) {
        const connection = await this.getConnection();
        try {
            await connection.beginTransaction();
            const result = await callback(connection);
            await connection.commit();
            return result;
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
    async testConnection() {
        try {
            await this.query('SELECT 1');
            return true;
        }
        catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }
    async getPoolStatus() {
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
            activeConnections: 0,
            idleConnections: 0,
            queuedRequests: 0
        };
    }
    async close() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            this.isConnected = false;
            console.log('Database connection pool closed');
        }
    }
    isHealthy() {
        return this.isConnected && this.pool !== null;
    }
}
exports.databaseService = new DatabaseService();
exports.default = exports.databaseService;
//# sourceMappingURL=connection.js.map