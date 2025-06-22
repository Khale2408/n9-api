"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("@fastify/cors"));
const database_1 = require("./config/database");
const productRoutes_1 = require("./routes/productRoutes");
const authRoutes_1 = require("./routes/authRoutes");
// Các route admin
const adminCustomerRoutes_1 = require("./routes/adminCustomerRoutes");
const adminProductRoutes_1 = require("./routes/adminProductRoutes");
const adminOrderRoutes_1 = require("./routes/adminOrderRoutes");
const adminReportRoutes_1 = require("./routes/adminReportRoutes");
// Route cho khách hàng mua hàng
const orderRoutes_1 = require("./routes/orderRoutes");
// Route bình luận sản phẩm
const commentRoutes_1 = require("./routes/commentRoutes");
dotenv_1.default.config();
const server = (0, fastify_1.default)({
    logger: {
        level: process.env.NODE_ENV === 'development' ? 'info' : 'warn'
    }
});
const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';
// Register CORS
server.register(cors_1.default, {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    credentials: true
});
// Global error handler
server.setErrorHandler(async (error, request, reply) => {
    server.log.error(error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    reply.status(statusCode).send({
        success: false,
        message,
        code: error.code || 'INTERNAL_SERVER_ERROR',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});
// Health check endpoint
server.get('/health', async (request, reply) => {
    return {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: 'connected'
    };
});
// API Info endpoint
server.get('/', async (request, reply) => {
    return {
        name: 'N9 Store API',
        version: '1.0.0',
        description: 'E-commerce API with Fastify and TypeScript',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            auth: '/api/v1/auth',
            products: '/api/v1/products',
            orders: '/api/v1/orders',
            comments: '/api/v1/comments',
            admin_customers: '/api/v1/admin/customers',
            admin_products: '/api/v1/admin/products',
            admin_orders: '/api/v1/admin/orders',
            admin_statistics: '/api/v1/admin/statistics'
        },
        documentation: 'Coming soon...',
        environment: process.env.NODE_ENV || 'development'
    };
});
// Register API routes
server.register(async function (fastify) {
    await fastify.register(productRoutes_1.productRoutes, { prefix: '/api/v1/products' });
    await fastify.register(authRoutes_1.authRoutes, { prefix: '/api/v1/auth' });
    // Đăng ký route mua hàng cho khách
    await fastify.register(orderRoutes_1.orderRoutes, { prefix: '/api/v1' });
    // Đăng ký route bình luận sản phẩm
    await fastify.register(commentRoutes_1.commentRoutes, { prefix: '/api/v1' });
    // Đăng ký các route admin
    await fastify.register(adminCustomerRoutes_1.adminCustomerRoutes, { prefix: '/api/v1/admin' });
    await fastify.register(adminProductRoutes_1.adminProductRoutes, { prefix: '/api/v1/admin' });
    await fastify.register(adminOrderRoutes_1.adminOrderRoutes, { prefix: '/api/v1/admin' });
    await fastify.register(adminReportRoutes_1.adminReportRoutes, { prefix: '/api/v1/admin' });
});
// 404 handler
server.setNotFoundHandler(async (request, reply) => {
    reply.status(404).send({
        success: false,
        message: 'Route not found',
        code: 'NOT_FOUND',
        path: request.url,
        method: request.method,
        available_endpoints: {
            auth: '/api/v1/auth',
            products: '/api/v1/products',
            orders: '/api/v1/orders',
            comments: '/api/v1/comments',
            admin_customers: '/api/v1/admin/customers',
            admin_products: '/api/v1/admin/products',
            admin_orders: '/api/v1/admin/orders',
            admin_statistics: '/api/v1/admin/statistics',
            health: '/health'
        }
    });
});
// Graceful shutdown
const gracefulShutdown = async (signal) => {
    server.log.info(`Received ${signal}, shutting down gracefully...`);
    try {
        await server.close();
        server.log.info('Server closed successfully');
        process.exit(0);
    }
    catch (error) {
        server.log.error('Error during shutdown:', error);
        process.exit(1);
    }
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Start server
const start = async () => {
    try {
        // Connect to database
        await (0, database_1.connectDB)();
        server.log.info('✅ Database connected successfully');
        // Start listening
        await server.listen({
            port: PORT,
            host: HOST
        });
        server.log.info(`🚀 Server running on http://${HOST}:${PORT}`);
        server.log.info(`📚 API Health Check: http://${HOST}:${PORT}/health`);
        server.log.info(`🔐 Auth API: http://${HOST}:${PORT}/api/v1/auth`);
        server.log.info(`📱 Products API: http://${HOST}:${PORT}/api/v1/products`);
        server.log.info(`🛒 Orders API: http://${HOST}:${PORT}/api/v1/orders`);
        server.log.info(`💬 Comments API: http://${HOST}:${PORT}/api/v1/comments`);
        server.log.info(`🛠️ Admin API: http://${HOST}:${PORT}/api/v1/admin`);
    }
    catch (err) {
        server.log.error('❌ Server startup failed:', err);
        process.exit(1);
    }
};
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    server.log.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    server.log.error('Uncaught Exception:', error);
    process.exit(1);
});
// Start the server
start();
