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
exports.searchProductsHandler = exports.getRelatedProductsHandler = exports.getFeaturedProductsHandler = exports.getProductBySlugHandler = exports.getProductByIdHandler = exports.getAllProductsHandler = void 0;
const productService = __importStar(require("../services/productService"));
const joi_1 = __importDefault(require("joi"));
const apiError_1 = require("../common/exceptions/apiError");
// Validation schemas
const productFilterSchema = joi_1.default.object({
    brand_id: joi_1.default.number().integer().positive().optional(),
    category_id: joi_1.default.number().integer().positive().optional(),
    min_price: joi_1.default.number().min(0).optional(),
    max_price: joi_1.default.number().min(0).optional(),
    featured: joi_1.default.boolean().optional(),
    status: joi_1.default.string().valid('active', 'inactive', 'out_of_stock', 'discontinued').optional(),
    search: joi_1.default.string().max(255).optional(),
    page: joi_1.default.number().integer().min(1).default(1).optional(),
    limit: joi_1.default.number().integer().min(1).max(100).default(20).optional(),
    sort_by: joi_1.default.string().valid('price', 'product_name', 'created_at', 'views_count', 'sales_count').default('created_at').optional(),
    sort_order: joi_1.default.string().valid('ASC', 'DESC').default('DESC').optional()
});
const productIdSchema = joi_1.default.object({
    id: joi_1.default.number().integer().positive().required().messages({
        'number.base': 'ID sản phẩm phải là số',
        'number.positive': 'ID sản phẩm phải là số dương',
        'any.required': 'ID sản phẩm là bắt buộc'
    })
});
const productSlugSchema = joi_1.default.object({
    slug: joi_1.default.string().min(1).max(200).required().messages({
        'string.empty': 'Slug sản phẩm không được để trống',
        'string.max': 'Slug sản phẩm không được quá 200 ký tự',
        'any.required': 'Slug sản phẩm là bắt buộc'
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
    console.error('Product Controller Error:', error);
    return reply.status(500).send({
        success: false,
        message: defaultMessage,
        code: 'INTERNAL_SERVER_ERROR'
    });
};
// Get all products with filters and pagination
const getAllProductsHandler = async (request, reply) => {
    try {
        // Validate query parameters
        const { error, value } = productFilterSchema.validate(request.query);
        if (error) {
            return reply.status(400).send({
                success: false,
                message: 'Tham số không hợp lệ',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                })),
                code: 'VALIDATION_ERROR'
            });
        }
        const result = await productService.getAllProducts(value);
        reply.status(200).send({
            success: true,
            message: 'Lấy danh sách sản phẩm thành công',
            data: result.products,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                total_pages: result.total_pages
            }
        });
    }
    catch (error) {
        handleError(error, reply, 'Lấy danh sách sản phẩm thất bại');
    }
};
exports.getAllProductsHandler = getAllProductsHandler;
// Get product by ID
const getProductByIdHandler = async (request, reply) => {
    try {
        // Validate product ID
        const { error, value } = productIdSchema.validate(request.params);
        if (error) {
            return reply.status(400).send({
                success: false,
                message: 'ID sản phẩm không hợp lệ',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                })),
                code: 'VALIDATION_ERROR'
            });
        }
        const product = await productService.getProductById(value.id);
        reply.status(200).send({
            success: true,
            message: 'Lấy thông tin sản phẩm thành công',
            data: product
        });
    }
    catch (error) {
        handleError(error, reply, 'Lấy thông tin sản phẩm thất bại');
    }
};
exports.getProductByIdHandler = getProductByIdHandler;
// Get product by slug
const getProductBySlugHandler = async (request, reply) => {
    try {
        // Validate product slug
        const { error, value } = productSlugSchema.validate(request.params);
        if (error) {
            return reply.status(400).send({
                success: false,
                message: 'Slug sản phẩm không hợp lệ',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                })),
                code: 'VALIDATION_ERROR'
            });
        }
        const product = await productService.getProductBySlug(value.slug);
        reply.status(200).send({
            success: true,
            message: 'Lấy thông tin sản phẩm thành công',
            data: product
        });
    }
    catch (error) {
        handleError(error, reply, 'Lấy thông tin sản phẩm thất bại');
    }
};
exports.getProductBySlugHandler = getProductBySlugHandler;
// Get featured products
const getFeaturedProductsHandler = async (request, reply) => {
    try {
        const query = request.query;
        const limit = query.limit ? parseInt(query.limit) : 10;
        // Validate limit
        if (isNaN(limit) || limit < 1 || limit > 50) {
            return reply.status(400).send({
                success: false,
                message: 'Limit phải là số từ 1 đến 50',
                code: 'VALIDATION_ERROR'
            });
        }
        const products = await productService.getFeaturedProducts(limit);
        reply.status(200).send({
            success: true,
            message: 'Lấy sản phẩm nổi bật thành công',
            data: products,
            total: products.length
        });
    }
    catch (error) {
        handleError(error, reply, 'Lấy sản phẩm nổi bật thất bại');
    }
};
exports.getFeaturedProductsHandler = getFeaturedProductsHandler;
// Get related products
const getRelatedProductsHandler = async (request, reply) => {
    try {
        // Validate product ID
        const { error, value } = productIdSchema.validate(request.params);
        if (error) {
            return reply.status(400).send({
                success: false,
                message: 'ID sản phẩm không hợp lệ',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                })),
                code: 'VALIDATION_ERROR'
            });
        }
        const query = request.query;
        const limit = query.limit ? parseInt(query.limit) : 8;
        // Validate limit
        if (isNaN(limit) || limit < 1 || limit > 20) {
            return reply.status(400).send({
                success: false,
                message: 'Limit phải là số từ 1 đến 20',
                code: 'VALIDATION_ERROR'
            });
        }
        const products = await productService.getRelatedProducts(value.id, limit);
        reply.status(200).send({
            success: true,
            message: 'Lấy sản phẩm liên quan thành công',
            data: products,
            total: products.length
        });
    }
    catch (error) {
        handleError(error, reply, 'Lấy sản phẩm liên quan thất bại');
    }
};
exports.getRelatedProductsHandler = getRelatedProductsHandler;
// Search products
const searchProductsHandler = async (request, reply) => {
    try {
        const query = request.query;
        if (!query.q || query.q.trim().length === 0) {
            return reply.status(400).send({
                success: false,
                message: 'Từ khóa tìm kiếm không được để trống',
                code: 'VALIDATION_ERROR'
            });
        }
        const filters = {
            search: query.q.trim(),
            page: query.page ? parseInt(query.page) : 1,
            limit: query.limit ? parseInt(query.limit) : 20,
            sort_by: query.sort_by || 'created_at',
            sort_order: query.sort_order?.toUpperCase() || 'DESC'
        };
        // Validate filters
        const { error, value } = productFilterSchema.validate(filters);
        if (error) {
            return reply.status(400).send({
                success: false,
                message: 'Tham số tìm kiếm không hợp lệ',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                })),
                code: 'VALIDATION_ERROR'
            });
        }
        const result = await productService.getAllProducts(value);
        reply.status(200).send({
            success: true,
            message: `Tìm thấy ${result.total} sản phẩm cho từ khóa "${query.q}"`,
            data: result.products,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                total_pages: result.total_pages
            },
            search_query: query.q
        });
    }
    catch (error) {
        handleError(error, reply, 'Tìm kiếm sản phẩm thất bại');
    }
};
exports.searchProductsHandler = searchProductsHandler;
