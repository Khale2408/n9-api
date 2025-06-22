import { FastifyInstance } from 'fastify';
import {
    approveOrderHandler,
    rejectOrderHandler,
    markShippedHandler
} from '../controllers/adminOrderController';
import { requireAdmin } from '../middleware/auth';

export async function adminOrderRoutes(fastify: FastifyInstance) {
    // Duyệt đơn
    fastify.post('/orders/:order_id/approve', { preHandler: [requireAdmin] }, approveOrderHandler);
    // Từ chối đơn
    fastify.post('/orders/:order_id/reject', { preHandler: [requireAdmin] }, rejectOrderHandler);
    // Đánh dấu đã giao hàng (nếu muốn tách riêng)
    fastify.post('/orders/:order_id/mark-shipped', { preHandler: [requireAdmin] }, markShippedHandler);
}