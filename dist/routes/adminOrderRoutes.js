"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOrderRoutes = adminOrderRoutes;
const adminOrderController_1 = require("../controllers/adminOrderController");
const auth_1 = require("../middleware/auth");
async function adminOrderRoutes(fastify) {
    // Duyệt đơn
    fastify.post('/orders/:order_id/approve', { preHandler: [auth_1.requireAdmin] }, adminOrderController_1.approveOrderHandler);
    // Từ chối đơn
    fastify.post('/orders/:order_id/reject', { preHandler: [auth_1.requireAdmin] }, adminOrderController_1.rejectOrderHandler);
    // Đánh dấu đã giao hàng (nếu muốn tách riêng)
    fastify.post('/orders/:order_id/mark-shipped', { preHandler: [auth_1.requireAdmin] }, adminOrderController_1.markShippedHandler);
}
