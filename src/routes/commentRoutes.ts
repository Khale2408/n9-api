import { FastifyInstance } from 'fastify';
import { addCommentHandler } from '../controllers/commentController';
import { requireCustomer } from '../middleware/auth';

export async function commentRoutes(fastify: FastifyInstance) {
    fastify.post('/comments', { preHandler: [requireCustomer] }, addCommentHandler);
}