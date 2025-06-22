"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDB = exports.getPool = exports.connectDB = void 0;
const mssql_1 = __importDefault(require("mssql"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    server: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT || '1433'),
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    connectionTimeout: 60000,
    requestTimeout: 60000
};
let pool = null;
const connectDB = async () => {
    try {
        if (pool) {
            console.log('✅ Using existing database connection');
            return;
        }
        pool = await new mssql_1.default.ConnectionPool(dbConfig).connect();
        console.log('✅ SQL Server connected successfully!');
        // Test connection
        const result = await pool.request().query('SELECT 1 as test');
        console.log('✅ Database test query successful');
    }
    catch (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const getPool = () => {
    if (!pool) {
        throw new Error('Database connection pool has not been initialized. Call connectDB first.');
    }
    return pool;
};
exports.getPool = getPool;
const closeDB = async () => {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            console.log('✅ Database connection closed');
        }
    }
    catch (err) {
        console.error('❌ Error closing database connection:', err);
    }
};
exports.closeDB = closeDB;
// Handle process termination
process.on('SIGINT', exports.closeDB);
process.on('SIGTERM', exports.closeDB);
