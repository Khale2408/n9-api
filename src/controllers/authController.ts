// src/controllers/authController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/authService';

export const registerHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        // body sẽ được Fastify tự động parse từ JSON
        const newUser = await authService.register(request.body as any);
        reply.status(201).send({ success: true, data: newUser });
    } catch (err) {
        throw err; // Ném lỗi để Fastify error handler xử lý
    }
};