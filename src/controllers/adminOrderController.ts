import { FastifyRequest, FastifyReply } from 'fastify';
import * as orderService from '../services/orderService';

export const approveOrderHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { order_id } = request.params as { order_id: string };
        const { tracking_code } = request.body as { tracking_code: string };
        const result = await orderService.approveOrder(Number(order_id), tracking_code);
        reply.send({
            success: true,
            message: 'Đơn hàng đã được duyệt, đang giao hàng',
            data: result
        });
    } catch (error: any) {
        reply.status(400).send({
            success: false,
            message: error.message || 'Duyệt đơn hàng thất bại'
        });
    }
};

export const rejectOrderHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { order_id } = request.params as { order_id: string };
        const result = await orderService.rejectOrder(Number(order_id));
        reply.send({
            success: true,
            message: 'Đơn hàng đã bị từ chối, đặt hàng không hoàn thành',
            data: result
        });
    } catch (error: any) {
        reply.status(400).send({
            success: false,
            message: error.message || 'Từ chối đơn hàng thất bại'
        });
    }
};

export const markShippedHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { order_id } = request.params as { order_id: string };
        const { tracking_code } = request.body as { tracking_code: string };
        const result = await orderService.markOrderShipped(Number(order_id), tracking_code);
        reply.send({
            success: true,
            message: 'Đơn hàng đã được chuyển sang trạng thái đang giao hàng',
            data: result
        });
    } catch (error: any) {
        reply.status(400).send({
            success: false,
            message: error.message || 'Cập nhật trạng thái giao hàng thất bại'
        });
    }
};