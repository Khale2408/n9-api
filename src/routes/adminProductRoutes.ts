import { FastifyInstance } from 'fastify';
import * as ctrl from '../controllers/adminProductController';

export async function adminProductRoutes(fastify: FastifyInstance) {
    fastify.get('/products', ctrl.getProducts);
    fastify.get('/products/:id', ctrl.getProductDetail);
    fastify.post('/products', ctrl.createProduct);
    fastify.patch('/products/:id', ctrl.updateProduct);
    fastify.delete('/products/:id', ctrl.deleteProduct);
}