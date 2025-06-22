// src/repositories/productRepository.ts
import { getPool } from '../config/database';
import sql from 'mssql';

export interface NewProductData {
    product_name: string;
    brand_id: number;
    category_id: number;
    price: number;
    stock_quantity: number;
    sku: string;
}

export interface UpdateProductData {
    product_name: string;
    price: number;
    stock_quantity: number;
}

class ProductRepository {
    public async findAll() {
        try {
            const pool = getPool();
            const result = await pool.request().query('SELECT product_id, product_name, price, sale_price FROM products WHERE deleted_at IS NULL');
            return result.recordset;
        } catch (error) {
            console.error('Error in ProductRepository.findAll:', error);
            throw error;
        }
    }

    public async findById(id: number): Promise<any | null> {
        try {
            const pool = getPool();
            const query = `SELECT * FROM products WHERE product_id = @productId AND deleted_at IS NULL;`;
            const result = await pool.request()
                .input('productId', sql.Int, id)
                .query(query);
            return result.recordset.length > 0 ? result.recordset[0] : null;
        } catch (error) {
            console.error(`Error in ProductRepository.findById for ID ${id}:`, error);
            throw error;
        }
    }

    public async create(productData: NewProductData): Promise<any> {
        // ... code của hàm create đã có ...
    }

    public async update(id: number, productData: UpdateProductData): Promise<any> {
        // ... code của hàm update đã có ...
    }

    /**
     * HÀM MỚI: Xóa mềm một sản phẩm
     * @param id ID của sản phẩm cần xóa
     */
    public async deleteById(id: number): Promise<any> {
        try {
            const pool = getPool();
            const query = `
                UPDATE products
                SET deleted_at = GETDATE()
                OUTPUT DELETED.*
                WHERE product_id = @productId AND deleted_at IS NULL;
            `;
            const result = await pool.request()
                .input('productId', sql.Int, id)
                .query(query);

            return result.recordset[0];
        } catch (error) {
            console.error(`Error in ProductRepository.deleteById for ID ${id}:`, error);
            throw error;
        }
    }
}

export const productRepository = new ProductRepository();