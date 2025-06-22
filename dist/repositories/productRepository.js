"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRepository = void 0;
// src/repositories/productRepository.ts
const database_1 = require("../config/database");
const mssql_1 = __importDefault(require("mssql"));
class ProductRepository {
    async findAll() {
        try {
            const pool = (0, database_1.getPool)();
            const result = await pool.request().query('SELECT product_id, product_name, price, sale_price FROM products WHERE deleted_at IS NULL');
            return result.recordset;
        }
        catch (error) {
            console.error('Error in ProductRepository.findAll:', error);
            throw error;
        }
    }
    async findById(id) {
        try {
            const pool = (0, database_1.getPool)();
            const query = `SELECT * FROM products WHERE product_id = @productId AND deleted_at IS NULL;`;
            const result = await pool.request()
                .input('productId', mssql_1.default.Int, id)
                .query(query);
            return result.recordset.length > 0 ? result.recordset[0] : null;
        }
        catch (error) {
            console.error(`Error in ProductRepository.findById for ID ${id}:`, error);
            throw error;
        }
    }
    async create(productData) {
        // ... code của hàm create đã có ...
    }
    async update(id, productData) {
        // ... code của hàm update đã có ...
    }
    /**
     * HÀM MỚI: Xóa mềm một sản phẩm
     * @param id ID của sản phẩm cần xóa
     */
    async deleteById(id) {
        try {
            const pool = (0, database_1.getPool)();
            const query = `
                UPDATE products
                SET deleted_at = GETDATE()
                OUTPUT DELETED.*
                WHERE product_id = @productId AND deleted_at IS NULL;
            `;
            const result = await pool.request()
                .input('productId', mssql_1.default.Int, id)
                .query(query);
            return result.recordset[0];
        }
        catch (error) {
            console.error(`Error in ProductRepository.deleteById for ID ${id}:`, error);
            throw error;
        }
    }
}
exports.productRepository = new ProductRepository();
