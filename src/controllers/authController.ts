import { FastifyRequest, FastifyReply } from 'fastify';
import * as authService from '../services/authService';
import Joi from 'joi';
import { ApiError, BadRequestError } from '../common/exceptions/apiError';

// Validation schemas
const registerSchema = Joi.object({
    full_name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Tên phải có ít nhất 2 ký tự',
        'string.max': 'Tên không được quá 100 ký tự',
        'any.required': 'Tên là bắt buộc'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email không hợp lệ',
        'any.required': 'Email là bắt buộc'
    }),
    password: Joi.string().min(6).max(50).required().messages({
        'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
        'string.max': 'Mật khẩu không được quá 50 ký tự',
        'any.required': 'Mật khẩu là bắt buộc'
    }),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(15).optional().messages({
        'string.pattern.base': 'Số điện thoại không hợp lệ',
        'string.min': 'Số điện thoại phải có ít nhất 10 số',
        'string.max': 'Số điện thoại không được quá 15 số'
    })
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email không hợp lệ',
        'any.required': 'Email là bắt buộc'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Mật khẩu là bắt buộc'
    })
});

const updateProfileSchema = Joi.object({
    full_name: Joi.string().min(2).max(100).optional().messages({
        'string.min': 'Tên phải có ít nhất 2 ký tự',
        'string.max': 'Tên không được quá 100 ký tự'
    }),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(15).optional().messages({
        'string.pattern.base': 'Số điện thoại không hợp lệ',
        'string.min': 'Số điện thoại phải có ít nhất 10 số',
        'string.max': 'Số điện thoại không được quá 15 số'
    })
});

// Helper function to handle errors
const handleError = (error: any, reply: FastifyReply, defaultMessage: string) => {
    if (error instanceof ApiError) {
        return reply.status(error.statusCode).send({
            success: false,
            message: error.message,
            code: error.constructor.name.toUpperCase()
        });
    }
    return reply.status(500).send({
        success: false,
        message: defaultMessage,
        code: 'INTERNAL_SERVER_ERROR'
    });
};

// Register new user
export const registerHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        // Validate input
        const { error, value } = registerSchema.validate(request.body);
        if (error) {
            return reply.status(400).send({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                })),
                code: 'VALIDATION_ERROR'
            });
        }
        const result = await authService.register(value);
        reply.status(201).send({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                user: result.user,
                token: result.token
            }
        });
    } catch (error: any) {
        handleError(error, reply, 'Đăng ký thất bại');
    }
};

// User login
export const loginHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        // Validate input
        const { error, value } = loginSchema.validate(request.body);
        if (error) {
            return reply.status(400).send({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                })),
                code: 'VALIDATION_ERROR'
            });
        }
        const result = await authService.login(value);

        // Đảm bảo result có user và token
        if (!result || !result.user || !result.token) {
            return reply.status(401).send({
                success: false,
                message: 'Email hoặc mật khẩu không đúng',
                code: 'UNAUTHORIZED'
            });
        }

        reply.status(200).send({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                user: result.user,
                token: result.token
            }
        });
    } catch (error: any) {
        handleError(error, reply, 'Đăng nhập thất bại');
    }
};

// Get user profile
export const profileHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        if (!request.user) {
            return reply.status(401).send({
                success: false,
                message: 'Authentication required',
                code: 'UNAUTHORIZED'
            });
        }
        const profile = await authService.getProfile(request.user.customer_id);
        reply.status(200).send({
            success: true,
            message: 'Lấy thông tin thành công',
            data: profile
        });
    } catch (error: any) {
        handleError(error, reply, 'Lấy thông tin thất bại');
    }
};

// Update user profile
export const updateProfileHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        if (!request.user) {
            return reply.status(401).send({
                success: false,
                message: 'Authentication required',
                code: 'UNAUTHORIZED'
            });
        }
        // Validate input
        const { error, value } = updateProfileSchema.validate(request.body);
        if (error) {
            return reply.status(400).send({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                })),
                code: 'VALIDATION_ERROR'
            });
        }
        const updatedProfile = await authService.updateProfile(request.user.customer_id, value);
        reply.status(200).send({
            success: true,
            message: 'Cập nhật thông tin thành công',
            data: updatedProfile
        });
    } catch (error: any) {
        handleError(error, reply, 'Cập nhật thông tin thất bại');
    }
};

// Logout (client-side token removal)
export const logoutHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        // Since we're using stateless JWT, logout is handled client-side
        // This endpoint just confirms the logout action
        reply.status(200).send({
            success: true,
            message: 'Đăng xuất thành công',
            data: null
        });
    } catch (error: any) {
        handleError(error, reply, 'Đăng xuất thất bại');
    }
};

// Verify token (check if token is valid)
export const verifyTokenHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        if (!request.user) {
            return reply.status(401).send({
                success: false,
                message: 'Invalid or expired token',
                code: 'UNAUTHORIZED'
            });
        }
        reply.status(200).send({
            success: true,
            message: 'Token is valid',
            data: {
                customer_id: request.user.customer_id,
                email: request.user.email,
                type: request.user.type
            }
        });
    } catch (error: any) {
        handleError(error, reply, 'Token verification failed');
    }
};