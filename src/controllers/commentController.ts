import { FastifyRequest, FastifyReply } from 'fastify';
import * as commentService from '../services/commentService';

export const addCommentHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const customer_id = request.user?.customer_id;
        const { product_id, order_id, content, rating } = request.body as any;

        // Kiểm tra đầu vào
        if (!customer_id || !product_id || !order_id || !content) {
            return reply.status(400).send({
                success: false,
                message: 'Thiếu thông tin bình luận'
            });
        }

        // Kiểm tra quyền bình luận
        const canComment = await commentService.canComment(customer_id, product_id, order_id);
        if (!canComment) {
            return reply.status(400).send({
                success: false,
                message: 'Bạn chỉ có thể bình luận sau khi đã nhận hàng sản phẩm này.'
            });
        }

        // Thêm bình luận
        const comment = await commentService.addComment({ customer_id, product_id, order_id, content, rating });
        reply.send({
            success: true,
            message: 'Bình luận thành công',
            data: comment
        });
    } catch (error: any) {
        reply.status(400).send({
            success: false,
            message: error.message || 'Bình luận thất bại'
        });
    }
};