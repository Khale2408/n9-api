import { FastifyRequest, FastifyReply } from 'fastify';
import * as service from '../services/adminReportService';

export const getStatistics = async (req: FastifyRequest, reply: FastifyReply) => {
    const data = await service.getStatistics();
    reply.send({ success: true, data });
};