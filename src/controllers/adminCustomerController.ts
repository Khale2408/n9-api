import { FastifyRequest, FastifyReply } from 'fastify';
import * as service from '../services/adminCustomerService';

export const getCustomers = async (req: FastifyRequest, reply: FastifyReply) => {
    const data = await service.getCustomers();
    reply.send({ success: true, data });
};

export const getCustomerDetail = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const data = await service.getCustomerDetail(Number(id));
    reply.send({ success: true, data });
};

export const updateCustomer = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const data = await service.updateCustomer(Number(id), req.body);
    reply.send({ success: true, data });
};

export const deleteCustomer = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    await service.deleteCustomer(Number(id));
    reply.send({ success: true });
};