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
exports.markShippedHandler = exports.rejectOrderHandler = exports.approveOrderHandler = void 0;
const orderService = __importStar(require("../services/orderService"));
const approveOrderHandler = async (request, reply) => {
    try {
        const { order_id } = request.params;
        const { tracking_code } = request.body;
        const result = await orderService.approveOrder(Number(order_id), tracking_code);
        reply.send({
            success: true,
            message: 'Đơn hàng đã được duyệt, đang giao hàng',
            data: result
        });
    }
    catch (error) {
        reply.status(400).send({
            success: false,
            message: error.message || 'Duyệt đơn hàng thất bại'
        });
    }
};
exports.approveOrderHandler = approveOrderHandler;
const rejectOrderHandler = async (request, reply) => {
    try {
        const { order_id } = request.params;
        const result = await orderService.rejectOrder(Number(order_id));
        reply.send({
            success: true,
            message: 'Đơn hàng đã bị từ chối, đặt hàng không hoàn thành',
            data: result
        });
    }
    catch (error) {
        reply.status(400).send({
            success: false,
            message: error.message || 'Từ chối đơn hàng thất bại'
        });
    }
};
exports.rejectOrderHandler = rejectOrderHandler;
const markShippedHandler = async (request, reply) => {
    try {
        const { order_id } = request.params;
        const { tracking_code } = request.body;
        const result = await orderService.markOrderShipped(Number(order_id), tracking_code);
        reply.send({
            success: true,
            message: 'Đơn hàng đã được chuyển sang trạng thái đang giao hàng',
            data: result
        });
    }
    catch (error) {
        reply.status(400).send({
            success: false,
            message: error.message || 'Cập nhật trạng thái giao hàng thất bại'
        });
    }
};
exports.markShippedHandler = markShippedHandler;
