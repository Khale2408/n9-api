import { FastifyRequest, FastifyReply } from 'fastify';
import * as productService from '../services/productService';
import Joi from 'joi';
import { ApiError } from '../common/exceptions/apiError';

// Validation schemas
const productFilterSchema = Joi.object({
    brand_id: Joi.number().integer().positive().optional(),
    category_id: Joi.number().integer().positive().optional(),
    min_price: Joi.number().min(0).optional(),
    max_price: Joi.number().min(0).optional(),
    featured: Joi.boolean().optional(),
    status: Joi.string().valid('active', 'inactive', 'out_of_stock', 'discontinued').optional(),
    search: Joi.string().max(255).optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(20).optional(),
    sort_by: Joi.string().valid('price', 'product_name', 'created_at', 'views_count', 'sales_count').default('created_at').optional(),
    sort_order: Joi.string().valid('ASC', 'DESC').default('DESC').optional()
});

const productIdSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'ID sản phẩm phải là số',
        'number.positive': 'ID sản phẩm phải là số dương',
        'any.required': 'ID sản phẩm là bắt buộc'
    })
});

const productSlugSchema = Joi.object({
    slug: Joi.string().min(1).max(200).required().messages({
        'string.empty': 'Slug sản phẩm không được để trống',
        'string.max': 'Slug sản phẩm không được quá 200 ký tự',
        'any.required': 'Slug sản phẩm là bắt buộc'
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
    
    console.error('Product Controller Error:', error);
    return reply.status(500).send({
        success: false,
        message: defaultMessage,
        code: 'INTERNAL_SERVER_ERROR'
    });
};

// Get all products with filters and pagination
export const getAllProductsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
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
    } catch (error: any) {
        handleError(error, reply, 'Lấy danh sách sản phẩm thất bại');
    }
};

// Get product by ID
export const getProductByIdHandler = async (request: FastifyRequest, reply: FastifyReply) => {
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
    } catch (error: any) {
        handleError(error, reply, 'Lấy thông tin sản phẩm thất bại');
    }
};

// Get product by slug
export const getProductBySlugHandler = async (request: FastifyRequest, reply: FastifyReply) => {
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
    } catch (error: any) {
        handleError(error, reply, 'Lấy thông tin sản phẩm thất bại');
    }
};

// Get featured products
export const getFeaturedProductsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const query = request.query as { limit?: string };
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
    } catch (error: any) {
        handleError(error, reply, 'Lấy sản phẩm nổi bật thất bại');
    }
};

// Get related products
export const getRelatedProductsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
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
        
        const query = request.query as { limit?: string };
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
    } catch (error: any) {
        handleError(error, reply, 'Lấy sản phẩm liên quan thất bại');
    }
};

// Search products
export const searchProductsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const query = request.query as { 
            q?: string; 
            page?: string; 
            limit?: string;
            sort_by?: string;
            sort_order?: string;
        };
        
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
            sort_order: (query.sort_order?.toUpperCase() as 'ASC' | 'DESC') || 'DESC'
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
    } catch (error: any) {
        handleError(error, reply, 'Tìm kiếm sản phẩm thất bại');
    }
};