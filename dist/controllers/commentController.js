"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCommentHandler = void 0;
const commentService = __importStar(require("../services/commentService"));
const addCommentHandler = async (request, reply) => {
    try {
        const customer_id = request.user?.customer_id;
        const { product_id, order_id, content, rating } = request.body;
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
    }
    catch (error) {
        reply.status(400).send({
            success: false,
            message: error.message || 'Bình luận thất bại'
        });
    }
};
exports.addCommentHandler = addCommentHandler;
