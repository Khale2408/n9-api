import { FastifyInstance } from 'fastify';
import * as ctrl from '../controllers/adminCustomerController';

export async function adminCustomerRoutes(fastify: FastifyInstance) {
    fastify.get('/customers', ctrl.getCustomers);
    fastify.get('/customers/:id', ctrl.getCustomerDetail);
    fastify.patch('/customers/:id', ctrl.updateCustomer);
    fastify.delete('/customers/:id', ctrl.deleteCustomer);
}