"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = orderRoutes;
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
async function orderRoutes(fastify) {
    // Đặt hàng: chỉ cho khách đã đăng nhập
    fastify.post('/orders', { preHandler: [auth_1.requireCustomer] }, orderController_1.createOrderHandler);
    // Xác nhận đã nhận hàng: chỉ cho khách đã đăng nhập
    fastify.post('/orders/:order_id/confirm-delivered', { preHandler: [auth_1.requireCustomer] }, orderController_1.confirmDeliveredHandler);
}
