"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markOrderDelivered = exports.markOrderShipped = exports.rejectOrder = exports.approveOrder = exports.createOrder = void 0;
const database_1 = require("../config/database");
const mssql_1 = __importDefault(require("mssql"));
// Tạo đơn hàng mới
const createOrder = async ({ customer_id, items, total_amount, shipping_address, note }) => {
    const pool = (0, database_1.getPool)();
    // Tạo đơn hàng
    const orderResult = await pool.request()
        .input('customer_id', mssql_1.default.Int, customer_id)
        .input('total_amount', mssql_1.default.Int, total_amount)
        .input('shipping_address', mssql_1.default.NVarChar(255), shipping_address)
        .input('note', mssql_1.default.NVarChar(255), note || null)
        .input('status', mssql_1.default.NVarChar(20), 'pending')
        .query(`
            INSERT INTO orders (customer_id, total_amount, shipping_address, note, status)
            OUTPUT INSERTED.order_id
            VALUES (@customer_id, @total_amount, @shipping_address, @note, @status)
        `);
    const order_id = orderResult.recordset[0].order_id;
    // Thêm từng item vào order_items
    for (const item of items) {
        await pool.request()
            .input('order_id', mssql_1.default.Int, order_id)
            .input('product_id', mssql_1.default.Int, item.product_id)
            .input('quantity', mssql_1.default.Int, item.quantity)
            .input('price', mssql_1.default.Int, item.price)
            .query(`
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (@order_id, @product_id, @quantity, @price)
            `);
    }
    return { order_id, customer_id, items, total_amount, shipping_address, note, status: 'pending' };
};
exports.createOrder = createOrder;
// Duyệt đơn hàng (admin)
const approveOrder = async (order_id, tracking_code) => {
    const pool = (0, database_1.getPool)();
    await pool.request()
        .input('order_id', mssql_1.default.Int, order_id)
        .input('status', mssql_1.default.NVarChar(20), 'shipping')
        .input('tracking_code', mssql_1.default.NVarChar(100), tracking_code)
        .query(`UPDATE orders SET status = @status, tracking_code = @tracking_code WHERE order_id = @order_id`);
    return { order_id, status: 'shipping', tracking_code };
};
exports.approveOrder = approveOrder;
// Từ chối đơn hàng (admin)
const rejectOrder = async (order_id) => {
    const pool = (0, database_1.getPool)();
    await pool.request()
        .input('order_id', mssql_1.default.Int, order_id)
        .input('status', mssql_1.default.NVarChar(20), 'rejected')
        .query(`UPDATE orders SET status = @status WHERE order_id = @order_id`);
    return { order_id, status: 'rejected' };
};
exports.rejectOrder = rejectOrder;
// Đánh dấu đơn hàng đã giao (admin)
const markOrderShipped = async (order_id, tracking_code) => {
    // Có thể gộp với approveOrder nếu muốn
    return (0, exports.approveOrder)(order_id, tracking_code);
};
exports.markOrderShipped = markOrderShipped;
// Khách xác nhận đã nhận hàng
const markOrderDelivered = async (order_id, customer_id) => {
    const pool = (0, database_1.getPool)();
    // Có thể kiểm tra quyền sở hữu đơn hàng ở đây nếu muốn
    await pool.request()
        .input('order_id', mssql_1.default.Int, order_id)
        .input('status', mssql_1.default.NVarChar(20), 'delivered')
        .input('delivered_at', mssql_1.default.DateTime, new Date())
        .query('UPDATE orders SET status = @status, delivered_at = @delivered_at WHERE order_id = @order_id');
    // Có thể tăng số đơn đã mua cho khách ở đây nếu muốn
};
exports.markOrderDelivered = markOrderDelivered;
