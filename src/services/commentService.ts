import { getPool } from '../config/database';
import sql from 'mssql';

export const canComment = async (customer_id: number, product_id: number, order_id: number) => {
    const pool = getPool();
    const result = await pool.request()
        .input('customer_id', sql.Int, customer_id)
        .input('product_id', sql.Int, product_id)
        .input('order_id', sql.Int, order_id)
        .query(`
            SELECT 1 FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            WHERE oi.product_id = @product_id AND o.customer_id = @customer_id
              AND oi.order_id = @order_id AND o.status = 'delivered'
        `);
    return result.recordset.length > 0;
};

export const addComment = async ({ customer_id, product_id, order_id, content, rating }: any) => {
    const pool = getPool();
    const result = await pool.request()
        .input('customer_id', sql.Int, customer_id)
        .input('product_id', sql.Int, product_id)
        .input('order_id', sql.Int, order_id)
        .input('content', sql.NVarChar(500), content)
        .input('rating', sql.Int, rating || null)
        .query(`
            INSERT INTO comments (customer_id, product_id, order_id, content, rating)
            OUTPUT INSERTED.*
            VALUES (@customer_id, @product_id, @order_id, @content, @rating)
        `);
    return result.recordset[0];
};