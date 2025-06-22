import { FastifyInstance } from 'fastify';
import * as ctrl from '../controllers/adminReportController';

export async function adminReportRoutes(fastify: FastifyInstance) {
    fastify.get('/statistics', ctrl.getStatistics);
}