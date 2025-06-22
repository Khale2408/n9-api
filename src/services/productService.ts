import { getPool } from '../config/database';
import sql from 'mssql';
import { BadRequestError, NotFoundError } from '../common/exceptions/apiError';

export interface Product {
    product_id: number;
    name: string;
    description?: string;
    price: number;
    brand_id?: number;
    brand_name?: string;
    category_id?: number;
    category_name?: string;
    status: string;
    warranty_period?: number;
    dimensions?: string;
    sales_count: number;
    created_at: Date;
    updated_at: Date;
    image_url?: string;
    stock: number;
    views_count: number;
    featured?: boolean;
    gallery_images?: string;
    main_image?: string;
    short_description?: string;
    stock_quantity?: number;
}

export interface ProductFilter {
    brand_id?: number;
    category_id?: number;
    min_price?: number;
    max_price?: number;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort_by?: 'price' | 'name' | 'created_at' | 'views_count' | 'sales_count';
    sort_order?: 'ASC' | 'DESC';
}

export interface ProductResponse {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export const getAllProducts = async (filters: ProductFilter = {}): Promise<ProductResponse> => {
    const pool = getPool();

    try {
        const {
            brand_id,
            category_id,
            min_price,
            max_price,
            status = 'active',
            search,
            page = 1,
            limit = 20,
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = filters;

        // Build WHERE conditions
        let whereConditions: string[] = ['p.deleted_at IS NULL'];
        const request = pool.request();

        if (brand_id) {
            whereConditions.push('p.brand_id = @brand_id');
            request.input('brand_id', sql.Int, brand_id);
        }

        if (category_id) {
            whereConditions.push('p.category_id = @category_id');
            request.input('category_id', sql.Int, category_id);
        }

        if (min_price !== undefined) {
            whereConditions.push('p.price >= @min_price');
            request.input('min_price', sql.Decimal(18, 2), min_price);
        }

        if (max_price !== undefined) {
            whereConditions.push('p.price <= @max_price');
            request.input('max_price', sql.Decimal(18, 2), max_price);
        }

        if (status) {
            whereConditions.push('p.status = @status');
            request.input('status', sql.NVarChar, status);
        }

        if (search) {
            whereConditions.push(`(
                p.name LIKE @search 
                OR p.description LIKE @search
                OR b.name LIKE @search
                OR c.name LIKE @search
            )`);
            request.input('search', sql.NVarChar, `%${search}%`);
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

        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);

        const productsResult = await request.query(productsQuery);

        return {
            products: productsResult.recordset,
            total,
            page,
            limit,
            total_pages
        };

    } catch (error: any) {
        throw new BadRequestError(`Lấy danh sách sản phẩm thất bại: ${error.message}`);
    }
};

export const getProductById = async (product_id: number): Promise<Product> => {
    const pool = getPool();

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
            .input('product_id', sql.Int, product_id)
            .query(query);

        if (result.recordset.length === 0) {
            throw new NotFoundError('Không tìm thấy sản phẩm');
        }

        // Update view count
        await pool.request()
            .input('product_id', sql.Int, product_id)
            .query(`
                UPDATE products 
                SET views_count = views_count + 1 
                WHERE product_id = @product_id
            `);

        return result.recordset[0];

    } catch (error: any) {
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new BadRequestError(`Lấy thông tin sản phẩm thất bại: ${error.message}`);
    }
};

export const getProductBySlug = async (slug: string): Promise<Product> => {
    const pool = getPool();

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
            .input('slug', sql.NVarChar, slug)
            .query(query);

        if (result.recordset.length === 0) {
            throw new NotFoundError('Không tìm thấy sản phẩm');
        }

        // Update view count
        await pool.request()
            .input('product_id', sql.Int, result.recordset[0].product_id)
            .query(`
                UPDATE products 
                SET views_count = views_count + 1 
                WHERE product_id = @product_id
            `);

        return result.recordset[0];

    } catch (error: any) {
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new BadRequestError(`Lấy thông tin sản phẩm thất bại: ${error.message}`);
    }
};

export const getFeaturedProducts = async (limit: number = 10): Promise<Product[]> => {
    const pool = getPool();

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
            .input('limit', sql.Int, limit)
            .query(query);

        return result.recordset;

    } catch (error: any) {
        throw new BadRequestError(`Lấy sản phẩm nổi bật thất bại: ${error.message}`);
    }
};

export const getRelatedProducts = async (product_id: number, limit: number = 8): Promise<Product[]> => {
    const pool = getPool();

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
            .input('product_id', sql.Int, product_id)
            .input('limit', sql.Int, limit)
            .query(query);

        return result.recordset;

    } catch (error: any) {
        throw new BadRequestError(`Lấy sản phẩm liên quan thất bại: ${error.message}`);
    }
};