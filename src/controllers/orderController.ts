import { FastifyRequest, FastifyReply } from 'fastify';
import * as orderService from '../services/orderService';

// Tạo đơn hàng (cho khách hàng)
export const createOrderHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const customer_id = request.user?.customer_id;
        const { items, total_amount, shipping_address, note } = request.body as any;

        if (!customer_id || !items || !total_amount || !shipping_address) {
            return reply.status(400).send({
                success: false,
                message: 'Thiếu thông tin đơn hàng'
            });
        }

        const order = await orderService.createOrder({
            customer_id,
            items,
            total_amount,
            shipping_address,
            note
        });

        reply.status(201).send({
            success: true,
            message: 'Đặt hàng thành công',
            data: order
        });
    } catch (error: any) {
        reply.status(400).send({
            success: false,
            message: error.message || 'Đặt hàng thất bại'
        });
    }
};

// Xác nhận đã nhận hàng (cho khách hàng)
export const confirmDeliveredHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { order_id } = request.params as { order_id: string };
        const customer_id = request.user?.customer_id;

        if (!order_id || !customer_id) {
            return reply.status(400).send({
                success: false,
                message: 'Thiếu thông tin xác nhận'
            });
        }

        await orderService.markOrderDelivered(Number(order_id), customer_id);
        reply.send({ success: true, message: 'Đã xác nhận nhận hàng thành công' });
    } catch (error: any) {
        reply.status(400).send({
            success: false,
            message: error.message || 'Xác nhận nhận hàng thất bại'
        });
    }
};