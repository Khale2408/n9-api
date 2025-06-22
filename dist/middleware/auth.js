"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireCustomer = exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const apiError_1 = require("../common/exceptions/apiError");
// Xác thực token, gán request.user nếu hợp lệ
const authenticateToken = async (request, reply) => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new apiError_1.UnauthorizedError('Access token is required');
        }
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;
        if (!token) {
            throw new apiError_1.UnauthorizedError('Access token is required');
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            request.user = decoded;
        }
        catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                throw new apiError_1.UnauthorizedError('Token has expired');
            }
            else if (jwtError.name === 'JsonWebTokenError') {
                throw new apiError_1.UnauthorizedError('Invalid token');
            }
            else {
                throw new apiError_1.UnauthorizedError('Token verification failed');
            }
        }
    }
    catch (error) {
        if (error instanceof apiError_1.UnauthorizedError) {
            return reply.status(error.statusCode).send({
                success: false,
                message: error.message,
                code: 'UNAUTHORIZED'
            });
        }
        return reply.status(401).send({
            success: false,
            message: 'Authentication failed',
            code: 'AUTH_ERROR'
        });
    }
};
exports.authenticateToken = authenticateToken;
// Xác thực không bắt buộc (dùng cho các route public, có thể có hoặc không có token)
const optionalAuth = async (request, reply) => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            // No token provided, continue without authentication
            return;
        }
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;
        if (!token) {
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            request.user = decoded;
        }
        catch (jwtError) {
            // Invalid token, but don't block the request
            // Just continue without setting user
        }
    }
    catch (error) {
        // Don't block the request, just continue without authentication
    }
};
exports.optionalAuth = optionalAuth;
// Middleware: chỉ cho phép khách hàng
const requireCustomer = async (request, reply) => {
    await (0, exports.authenticateToken)(request, reply);
    if (!request.user) {
        return reply.status(401).send({
            success: false,
            message: 'Authentication required',
            code: 'UNAUTHORIZED'
        });
    }
    if (request.user.type !== 'customer') {
        return reply.status(403).send({
            success: false,
            message: 'Customer access required',
            code: 'FORBIDDEN'
        });
    }
};
exports.requireCustomer = requireCustomer;
// Middleware: chỉ cho phép admin
const requireAdmin = async (request, reply) => {
    await (0, exports.authenticateToken)(request, reply);
    if (!request.user) {
        return reply.status(401).send({
            success: false,
            message: 'Authentication required',
            code: 'UNAUTHORIZED'
        });
    }
    if (request.user.type !== 'admin') {
        return reply.status(403).send({
            success: false,
            message: 'Admin access required',
            code: 'FORBIDDEN'
        });
    }
};
exports.requireAdmin = requireAdmin;
