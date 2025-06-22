"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenHandler = exports.logoutHandler = exports.updateProfileHandler = exports.profileHandler = exports.loginHandler = exports.registerHandler = void 0;
const authService = __importStar(require("../services/authService"));
const joi_1 = __importDefault(require("joi"));
const apiError_1 = require("../common/exceptions/apiError");
// Validation schemas
const registerSchema = joi_1.default.object({
    full_name: joi_1.default.string().min(2).max(100).required().messages({
        'string.min': 'Tên phải có ít nhất 2 ký tự',
        'string.max': 'Tên không được quá 100 ký tự',
        'any.required': 'Tên là bắt buộc'
    }),
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Email không hợp lệ',
        'any.required': 'Email là bắt buộc'
    }),
    password: joi_1.default.string().min(6).max(50).required().messages({
        'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
        'string.max': 'Mật khẩu không được quá 50 ký tự',
        'any.required': 'Mật khẩu là bắt buộc'
    }),
    phone: joi_1.default.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(15).optional().messages({
        'string.pattern.base': 'Số điện thoại không hợp lệ',
        'string.min': 'Số điện thoại phải có ít nhất 10 số',
        'string.max': 'Số điện thoại không được quá 15 số'
    })
});
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Email không hợp lệ',
        'any.required': 'Email là bắt buộc'
    }),
    password: joi_1.default.string().required().messages({
        'any.required': 'Mật khẩu là bắt buộc'
    })
});
const updateProfileSchema = joi_1.default.object({
    full_name: joi_1.default.string().min(2).max(100).optional().messages({
        'string.min': 'Tên phải có ít nhất 2 ký tự',
        'string.max': 'Tên không được quá 100 ký tự'
    }),
    phone: joi_1.default.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(15).optional().messages({
        'string.pattern.base': 'Số điện thoại không hợp lệ',
        'string.min': 'Số điện thoại phải có ít nhất 10 số',
        'string.max': 'Số điện thoại không được quá 15 số'
    })
});
// Helper function to handle errors
const handleError = (error, reply, defaultMessage) => {
    if (error instanceof apiError_1.ApiError) {
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
const registerHandler = async (request, reply) => {
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
    }
    catch (error) {
        handleError(error, reply, 'Đăng ký thất bại');
    }
};
exports.registerHandler = registerHandler;
// User login
const loginHandler = async (request, reply) => {
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
    }
    catch (error) {
        handleError(error, reply, 'Đăng nhập thất bại');
    }
};
exports.loginHandler = loginHandler;
// Get user profile
const profileHandler = async (request, reply) => {
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
    }
    catch (error) {
        handleError(error, reply, 'Lấy thông tin thất bại');
    }
};
exports.profileHandler = profileHandler;
// Update user profile
const updateProfileHandler = async (request, reply) => {
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
    }
    catch (error) {
        handleError(error, reply, 'Cập nhật thông tin thất bại');
    }
};
exports.updateProfileHandler = updateProfileHandler;
// Logout (client-side token removal)
const logoutHandler = async (request, reply) => {
    try {
        // Since we're using stateless JWT, logout is handled client-side
        // This endpoint just confirms the logout action
        reply.status(200).send({
            success: true,
            message: 'Đăng xuất thành công',
            data: null
        });
    }
    catch (error) {
        handleError(error, reply, 'Đăng xuất thất bại');
    }
};
exports.logoutHandler = logoutHandler;
// Verify token (check if token is valid)
const verifyTokenHandler = async (request, reply) => {
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
    }
    catch (error) {
        handleError(error, reply, 'Token verification failed');
    }
};
exports.verifyTokenHandler = verifyTokenHandler;
