"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markOrderDelivered = exports.markOrderShipped = exports.rejectOrder = exports.approveOrder = void 0;
const database_1 = require("../config/database");
const mssql_1 = __importDefault(require("mssql"));
// ...các hàm đã có...
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
const rejectOrder = async (order_id) => {
    const pool = (0, database_1.getPool)();
    await pool.request()
        .input('order_id', mssql_1.default.Int, order_id)
        .input('status', mssql_1.default.NVarChar(20), 'rejected')
        .query(`UPDATE orders SET status = @status WHERE order_id = @order_id`);
    return { order_id, status: 'rejected' };
};
exports.rejectOrder = rejectOrder;
const markOrderShipped = async (order_id, tracking_code) => {
    // Có thể gộp với approveOrder nếu muốn
    return (0, exports.approveOrder)(order_id, tracking_code);
};
exports.markOrderShipped = markOrderShipped;
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
