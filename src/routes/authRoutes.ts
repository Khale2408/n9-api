import { FastifyInstance } from 'fastify';
import {
    registerHandler,
    loginHandler,
    profileHandler,
    updateProfileHandler,
    logoutHandler,
    verifyTokenHandler
} from '../controllers/authController';
import { authenticateToken, requireCustomer } from '../middleware/auth';

export async function authRoutes(fastify: FastifyInstance) {
    // Public routes
    fastify.post('/register', registerHandler);
    fastify.post('/login', loginHandler);
    
    // Protected routes
    fastify.get('/profile', {
        preHandler: [requireCustomer]
    }, profileHandler);
    
    fastify.put('/profile', {
        preHandler: [requireCustomer]
    }, updateProfileHandler);
    
    fastify.post('/logout', {
        preHandler: [authenticateToken]
    }, logoutHandler);
    
    fastify.get('/verify', {
        preHandler: [authenticateToken]
    }, verifyTokenHandler);
    
    // Test endpoint
    fastify.get('/test', async (request, reply) => {
        return { 
            message: 'Auth routes working!',
            timestamp: new Date().toISOString(),
            endpoints: [
                'POST /register',
                'POST /login', 
                'GET /profile',
                'PUT /profile',
                'POST /logout',
                'GET /verify'
            ]
        };
    });
}