import sql from 'mssql';
import dotenv from 'dotenv';

// Đọc các biến môi trường từ file .env
dotenv.config();

const dbConfig: sql.config = {
    server: process.env.DB_SERVER!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_DATABASE!,
    port: parseInt(process.env.DB_PORT!),
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

let pool: sql.ConnectionPool;

export const connectDB = async () => {
    try {
        pool = await new sql.ConnectionPool(dbConfig).connect();
        console.log('✅ SQL Server connected successfully!');
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }
};

export const getPool = (): sql.ConnectionPool => {
    if (!pool) {
        throw new Error('Database connection pool has not been initialized.');
    }
    return pool;
};