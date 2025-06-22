// src/controllers/productController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
// import { productService } from '../services/productService'; // Tạm thời không dùng

export const getAllProductsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        // Trả về dữ liệu mẫu để kiểm tra
        const sampleProducts = [
            { id: 1, name: 'Product from Deployed Server 1' },
            { id: 2, name: 'Product from Deployed Server 2' }
        ];
        return { success: true, data: sampleProducts };
    } catch (err) {
        console.error(err);
        reply.status(500).send({ success: false, message: 'Internal Server Error' });
    }
};

// Các hàm handler khác có thể được comment lại hoặc để trống
export const getProductByIdHandler = async (request: FastifyRequest, reply: FastifyReply) => {};
export const createProductHandler = async (request: FastifyRequest, reply: FastifyReply) => {};
export const updateProductHandler = async (request: FastifyRequest, reply: FastifyReply) => {};
export const deleteProductHandler = async (request: FastifyRequest, reply: FastifyReply) => {};