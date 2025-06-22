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
exports.confirmDeliveredHandler = exports.createOrderHandler = void 0;
const orderService = __importStar(require("../services/orderService"));
// Tạo đơn hàng (cho khách hàng)
const createOrderHandler = async (request, reply) => {
    try {
        const customer_id = request.user?.customer_id;
        const { items, total_amount, shipping_address, note } = request.body;
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
    }
    catch (error) {
        reply.status(400).send({
            success: false,
            message: error.message || 'Đặt hàng thất bại'
        });
    }
};
exports.createOrderHandler = createOrderHandler;
// Xác nhận đã nhận hàng (cho khách hàng)
const confirmDeliveredHandler = async (request, reply) => {
    try {
        const { order_id } = request.params;
        const customer_id = request.user?.customer_id;
        if (!order_id || !customer_id) {
            return reply.status(400).send({
                success: false,
                message: 'Thiếu thông tin xác nhận'
            });
        }
        await orderService.markOrderDelivered(Number(order_id), customer_id);
        reply.send({ success: true, message: 'Đã xác nhận nhận hàng thành công' });
    }
    catch (error) {
        reply.status(400).send({
            success: false,
            message: error.message || 'Xác nhận nhận hàng thất bại'
        });
    }
};
exports.confirmDeliveredHandler = confirmDeliveredHandler;
