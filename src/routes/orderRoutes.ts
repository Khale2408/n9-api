import { FastifyInstance } from 'fastify';
import { createOrderHandler, confirmDeliveredHandler } from '../controllers/orderController';
import { requireCustomer } from '../middleware/auth';

export async function orderRoutes(fastify: FastifyInstance) {
    // Đặt hàng: chỉ cho khách đã đăng nhập
    fastify.post('/orders', { preHandler: [requireCustomer] }, createOrderHandler);

    // Xác nhận đã nhận hàng: chỉ cho khách đã đăng nhập
    fastify.post('/orders/:order_id/confirm-delivered', { preHandler: [requireCustomer] }, confirmDeliveredHandler);
}