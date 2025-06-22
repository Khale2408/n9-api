import { getPool } from '../config/database';
import sql from 'mssql';

// Tạo đơn hàng mới
export const createOrder = async ({ customer_id, items, total_amount, shipping_address, note }: any) => {
    const pool = getPool();

    // Tạo đơn hàng
    const orderResult = await pool.request()
        .input('customer_id', sql.Int, customer_id)
        .input('total_amount', sql.Int, total_amount)
        .input('shipping_address', sql.NVarChar(255), shipping_address)
        .input('note', sql.NVarChar(255), note || null)
        .input('status', sql.NVarChar(20), 'pending')
        .query(`
            INSERT INTO orders (customer_id, total_amount, shipping_address, note, status)
            OUTPUT INSERTED.order_id
            VALUES (@customer_id, @total_amount, @shipping_address, @note, @status)
        `);

    const order_id = orderResult.recordset[0].order_id;

    // Thêm từng item vào order_items
    for (const item of items) {
        await pool.request()
            .input('order_id', sql.Int, order_id)
            .input('product_id', sql.Int, item.product_id)
            .input('quantity', sql.Int, item.quantity)
            .input('price', sql.Int, item.price)
            .query(`
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (@order_id, @product_id, @quantity, @price)
            `);
    }

    return { order_id, customer_id, items, total_amount, shipping_address, note, status: 'pending' };
};

// Duyệt đơn hàng (admin)
export const approveOrder = async (order_id: number, tracking_code: string) => {
    const pool = getPool();
    await pool.request()
        .input('order_id', sql.Int, order_id)
        .input('status', sql.NVarChar(20), 'shipping')
        .input('tracking_code', sql.NVarChar(100), tracking_code)
        .query(`UPDATE orders SET status = @status, tracking_code = @tracking_code WHERE order_id = @order_id`);
    return { order_id, status: 'shipping', tracking_code };
};

// Từ chối đơn hàng (admin)
export const rejectOrder = async (order_id: number) => {
    const pool = getPool();
    await pool.request()
        .input('order_id', sql.Int, order_id)
        .input('status', sql.NVarChar(20), 'rejected')
        .query(`UPDATE orders SET status = @status WHERE order_id = @order_id`);
    return { order_id, status: 'rejected' };
};

// Đánh dấu đơn hàng đã giao (admin)
export const markOrderShipped = async (order_id: number, tracking_code: string) => {
    // Có thể gộp với approveOrder nếu muốn
    return approveOrder(order_id, tracking_code);
};

// Khách xác nhận đã nhận hàng
export const markOrderDelivered = async (order_id: number, customer_id: number) => {
    const pool = getPool();
    // Có thể kiểm tra quyền sở hữu đơn hàng ở đây nếu muốn
    await pool.request()
        .input('order_id', sql.Int, order_id)
        .input('status', sql.NVarChar(20), 'delivered')
        .input('delivered_at', sql.DateTime, new Date())
        .query('UPDATE orders SET status = @status, delivered_at = @delivered_at WHERE order_id = @order_id');
    // Có thể tăng số đơn đã mua cho khách ở đây nếu muốn
};