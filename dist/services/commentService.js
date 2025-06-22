"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComment = exports.canComment = void 0;
const database_1 = require("../config/database");
const mssql_1 = __importDefault(require("mssql"));
const canComment = async (customer_id, product_id, order_id) => {
    const pool = (0, database_1.getPool)();
    const result = await pool.request()
        .input('customer_id', mssql_1.default.Int, customer_id)
        .input('product_id', mssql_1.default.Int, product_id)
        .input('order_id', mssql_1.default.Int, order_id)
        .query(`
            SELECT 1 FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            WHERE oi.product_id = @product_id AND o.customer_id = @customer_id
              AND oi.order_id = @order_id AND o.status = 'delivered'
        `);
    return result.recordset.length > 0;
};
exports.canComment = canComment;
const addComment = async ({ customer_id, product_id, order_id, content, rating }) => {
    const pool = (0, database_1.getPool)();
    const result = await pool.request()
        .input('customer_id', mssql_1.default.Int, customer_id)
        .input('product_id', mssql_1.default.Int, product_id)
        .input('order_id', mssql_1.default.Int, order_id)
        .input('content', mssql_1.default.NVarChar(500), content)
        .input('rating', mssql_1.default.Int, rating || null)
        .query(`
            INSERT INTO comments (customer_id, product_id, order_id, content, rating)
            OUTPUT INSERTED.*
            VALUES (@customer_id, @product_id, @order_id, @content, @rating)
        `);
    return result.recordset[0];
};
exports.addComment = addComment;
