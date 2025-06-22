"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelatedProducts = exports.getFeaturedProducts = exports.getProductBySlug = exports.getProductById = exports.getAllProducts = void 0;
const database_1 = require("../config/database");
const mssql_1 = __importDefault(require("mssql"));
const apiError_1 = require("../common/exceptions/apiError");
const getAllProducts = async (filters = {}) => {
    const pool = (0, database_1.getPool)();
    try {
        const { brand_id, category_id, min_price, max_price, status = 'active', search, page = 1, limit = 20, sort_by = 'created_at', sort_order = 'DESC' } = filters;
        // Build WHERE conditions
        let whereConditions = ['p.deleted_at IS NULL'];
        const request = pool.request();
        if (brand_id) {
            whereConditions.push('p.brand_id = @brand_id');
            request.input('brand_id', mssql_1.default.Int, brand_id);
        }
        if (category_id) {
            whereConditions.push('p.category_id = @category_id');
            request.input('category_id', mssql_1.default.Int, category_id);
        }
        if (min_price !== undefined) {
            whereConditions.push('p.price >= @min_price');
            request.input('min_price', mssql_1.default.Decimal(18, 2), min_price);
        }
        if (max_price !== undefined) {
            whereConditions.push('p.price <= @max_price');
            request.input('max_price', mssql_1.default.Decimal(18, 2), max_price);
        }
        if (status) {
            whereConditions.push('p.status = @status');
            request.input('status', mssql_1.default.NVarChar, status);
        }
        if (search) {
            whereConditions.push(`(
                p.name LIKE @search 
                OR p.description LIKE @search
                OR b.name LIKE @search
                OR c.name LIKE @search
            )`);
            request.input('search', mssql_1.default.NVarChar, `%${search}%`);
        }
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        // Build ORDER BY
        const validSortColumns = ['price', 'name', 'created_at', 'views_count', 'sales_count'];
        const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
        const sortDirection = sort_order === 'ASC' ? 'ASC' : 'DESC';
        // Count total records
        const countQuery = `
            SELECT COUNT(*) as total
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            ${whereClause}
        `;
        const countResult = await request.query(countQuery);
        const total = countResult.recordset[0].total;
        // Calculate pagination
        const offset = (page - 1) * limit;
        const total_pages = Math.ceil(total / limit);
        // Get products with pagination
        const productsQuery = `
            SELECT 
                p.product_id, p.name, p.description, p.price, p.brand_id, b.name AS brand_name,
                p.category_id, c.name AS category_name, p.status, p.warranty_period, p.dimensions,
                p.sales_count, p.created_at, p.updated_at, p.image_url, p.stock,
                p.views_count, p.featured, p.gallery_images, p.main_image, p.short_description, p.stock_quantity
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            ${whereClause}
            ORDER BY p.${sortColumn} ${sortDirection}
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;
        request.input('offset', mssql_1.default.Int, offset);
        request.input('limit', mssql_1.default.Int, limit);
        const productsResult = await request.query(productsQuery);
        return {
            products: productsResult.recordset,
            total,
            page,
            limit,
            total_pages
        };
    }
    catch (error) {
        throw new apiError_1.BadRequestError(`Lấy danh sách sản phẩm thất bại: ${error.message}`);
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (product_id) => {
    const pool = (0, database_1.getPool)();
    try {
        const query = `
            SELECT 
                p.product_id, p.name, p.description, p.price, p.brand_id, b.name AS brand_name,
                p.category_id, c.name AS category_name, p.status, p.warranty_period, p.dimensions,
                p.sales_count, p.created_at, p.updated_at, p.image_url, p.stock,
                p.views_count, p.featured, p.gallery_images, p.main_image, p.short_description, p.stock_quantity
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE p.product_id = @product_id AND p.deleted_at IS NULL
        `;
        const result = await pool.request()
            .input('product_id', mssql_1.default.Int, product_id)
            .query(query);
        if (result.recordset.length === 0) {
            throw new apiError_1.NotFoundError('Không tìm thấy sản phẩm');
        }
        // Update view count
        await pool.request()
            .input('product_id', mssql_1.default.Int, product_id)
            .query(`
                UPDATE products 
                SET views_count = views_count + 1 
                WHERE product_id = @product_id
            `);
        return result.recordset[0];
    }
    catch (error) {
        if (error instanceof apiError_1.NotFoundError) {
            throw error;
        }
        throw new apiError_1.BadRequestError(`Lấy thông tin sản phẩm thất bại: ${error.message}`);
    }
};
exports.getProductById = getProductById;
const getProductBySlug = async (slug) => {
    const pool = (0, database_1.getPool)();
    try {
        const query = `
            SELECT 
                p.product_id, p.name, p.description, p.price, p.brand_id, b.name AS brand_name,
                p.category_id, c.name AS category_name, p.status, p.warranty_period, p.dimensions,
                p.sales_count, p.created_at, p.updated_at, p.image_url, p.stock,
                p.views_count, p.featured, p.gallery_images, p.main_image, p.short_description, p.stock_quantity
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE p.main_image = @slug AND p.deleted_at IS NULL
        `;
        const result = await pool.request()
            .input('slug', mssql_1.default.NVarChar, slug)
            .query(query);
        if (result.recordset.length === 0) {
            throw new apiError_1.NotFoundError('Không tìm thấy sản phẩm');
        }
        // Update view count
        await pool.request()
            .input('product_id', mssql_1.default.Int, result.recordset[0].product_id)
            .query(`
                UPDATE products 
                SET views_count = views_count + 1 
                WHERE product_id = @product_id
            `);
        return result.recordset[0];
    }
    catch (error) {
        if (error instanceof apiError_1.NotFoundError) {
            throw error;
        }
        throw new apiError_1.BadRequestError(`Lấy thông tin sản phẩm thất bại: ${error.message}`);
    }
};
exports.getProductBySlug = getProductBySlug;
const getFeaturedProducts = async (limit = 10) => {
    const pool = (0, database_1.getPool)();
    try {
        const query = `
            SELECT TOP (@limit)
                p.product_id, p.name, p.description, p.price, p.brand_id, b.name AS brand_name,
                p.category_id, c.name AS category_name, p.status, p.warranty_period, p.dimensions,
                p.sales_count, p.created_at, p.updated_at, p.image_url, p.stock,
                p.views_count, p.featured, p.gallery_images, p.main_image, p.short_description, p.stock_quantity
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE p.status = 'active' AND p.deleted_at IS NULL
            ORDER BY p.created_at DESC
        `;
        const result = await pool.request()
            .input('limit', mssql_1.default.Int, limit)
            .query(query);
        return result.recordset;
    }
    catch (error) {
        throw new apiError_1.BadRequestError(`Lấy sản phẩm nổi bật thất bại: ${error.message}`);
    }
};
exports.getFeaturedProducts = getFeaturedProducts;
const getRelatedProducts = async (product_id, limit = 8) => {
    const pool = (0, database_1.getPool)();
    try {
        const query = `
            SELECT TOP (@limit)
                p2.product_id, p2.name, p2.description, p2.price, p2.brand_id, b.name AS brand_name,
                p2.category_id, c.name AS category_name, p2.status, p2.warranty_period, p2.dimensions,
                p2.sales_count, p2.created_at, p2.updated_at, p2.image_url, p2.stock,
                p2.views_count, p2.featured, p2.gallery_images, p2.main_image, p2.short_description, p2.stock_quantity
            FROM products p1
            INNER JOIN products p2 ON (
                p1.category_id = p2.category_id 
                OR p1.brand_id = p2.brand_id
            )
            LEFT JOIN brands b ON p2.brand_id = b.brand_id
            LEFT JOIN categories c ON p2.category_id = c.category_id
            WHERE p1.product_id = @product_id 
                AND p2.product_id != @product_id
                AND p2.status = 'active' 
                AND p2.deleted_at IS NULL
            ORDER BY p2.sales_count DESC, p2.views_count DESC
        `;
        const result = await pool.request()
            .input('product_id', mssql_1.default.Int, product_id)
            .input('limit', mssql_1.default.Int, limit)
            .query(query);
        return result.recordset;
    }
    catch (error) {
        throw new apiError_1.BadRequestError(`Lấy sản phẩm liên quan thất bại: ${error.message}`);
    }
};
exports.getRelatedProducts = getRelatedProducts;
