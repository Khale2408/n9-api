import { getPool } from '../config/database';
import sql from 'mssql';

// ...các hàm đã có...

export const approveOrder = async (order_id: number, tracking_code: string) => {
    const pool = getPool();
    await pool.request()
        .input('order_id', sql.Int, order_id)
        .input('status', sql.NVarChar(20), 'shipping')
        .input('tracking_code', sql.NVarChar(100), tracking_code)
        .query(`UPDATE orders SET status = @status, tracking_code = @tracking_code WHERE order_id = @order_id`);
    return { order_id, status: 'shipping', tracking_code };
};

export const rejectOrder = async (order_id: number) => {
    const pool = getPool();
    await pool.request()
        .input('order_id', sql.Int, order_id)
        .input('status', sql.NVarChar(20), 'rejected')
        .query(`UPDATE orders SET status = @status WHERE order_id = @order_id`);
    return { order_id, status: 'rejected' };
};

export const markOrderShipped = async (order_id: number, tracking_code: string) => {
    // Có thể gộp với approveOrder nếu muốn
    return approveOrder(order_id, tracking_code);
};

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