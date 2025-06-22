import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: sql.config = {
    server: process.env.DB_SERVER!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_DATABASE!,
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

let pool: sql.ConnectionPool | null = null;

export const connectDB = async (): Promise<void> => {
    try {
        if (pool) {
            console.log('✅ Using existing database connection');
            return;
        }

        pool = await new sql.ConnectionPool(dbConfig).connect();
        console.log('✅ SQL Server connected successfully!');
        
        // Test connection
        const result = await pool.request().query('SELECT 1 as test');
        console.log('✅ Database test query successful');
        
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }
};

export const getPool = (): sql.ConnectionPool => {
    if (!pool) {
        throw new Error('Database connection pool has not been initialized. Call connectDB first.');
    }
    return pool;
};

export const closeDB = async (): Promise<void> => {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            console.log('✅ Database connection closed');
        }
    } catch (err) {
        console.error('❌ Error closing database connection:', err);
    }
};

// Handle process termination
process.on('SIGINT', closeDB);
process.on('SIGTERM', closeDB);