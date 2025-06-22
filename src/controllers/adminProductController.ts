import { FastifyRequest, FastifyReply } from 'fastify';
import * as service from '../services/adminProductService';

export const getProducts = async (req: FastifyRequest, reply: FastifyReply) => {
    const data = await service.getProducts();
    reply.send({ success: true, data });
};

export const getProductDetail = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const data = await service.getProductDetail(Number(id));
    reply.send({ success: true, data });
};

export const createProduct = async (req: FastifyRequest, reply: FastifyReply) => {
    const data = await service.createProduct(req.body);
    reply.send({ success: true, data });
};

export const updateProduct = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const data = await service.updateProduct(Number(id), req.body);
    reply.send({ success: true, data });
};

export const deleteProduct = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    await service.deleteProduct(Number(id));
    reply.send({ success: true });
};