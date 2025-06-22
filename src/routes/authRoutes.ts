// src/routes/authRoutes.ts
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { registerHandler } from '../controllers/authController';

export const authRoutes = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
    fastify.post('/register', registerHandler);
    // Sau này sẽ thêm route /login ở đây
};