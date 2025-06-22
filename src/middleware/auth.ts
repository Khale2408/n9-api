import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../common/exceptions/apiError';

export interface JWTPayload {
    customer_id: number;
    email: string;
    type: 'customer' | 'admin';
    iat?: number;
    exp?: number;
}

// Extend FastifyRequest to include user
declare module 'fastify' {
    interface FastifyRequest {
        user?: JWTPayload;
    }
}

// Xác thực token, gán request.user nếu hợp lệ
export const authenticateToken = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedError('Access token is required');
        }

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        if (!token) {
            throw new UnauthorizedError('Access token is required');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
            request.user = decoded;
        } catch (jwtError: any) {
            if (jwtError.name === 'TokenExpiredError') {
                throw new UnauthorizedError('Token has expired');
            } else if (jwtError.name === 'JsonWebTokenError') {
                throw new UnauthorizedError('Invalid token');
            } else {
                throw new UnauthorizedError('Token verification failed');
            }
        }

    } catch (error: any) {
        if (error instanceof UnauthorizedError) {
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

// Xác thực không bắt buộc (dùng cho các route public, có thể có hoặc không có token)
export const optionalAuth = async (request: FastifyRequest, reply: FastifyReply) => {
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
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
            request.user = decoded;
        } catch (jwtError) {
            // Invalid token, but don't block the request
            // Just continue without setting user
        }

    } catch (error) {
        // Don't block the request, just continue without authentication
    }
};

// Middleware: chỉ cho phép khách hàng
export const requireCustomer = async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticateToken(request, reply);

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

// Middleware: chỉ cho phép admin
export const requireAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticateToken(request, reply);

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