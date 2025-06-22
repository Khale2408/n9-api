"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
async function authRoutes(fastify) {
    // Public routes
    fastify.post('/register', authController_1.registerHandler);
    fastify.post('/login', authController_1.loginHandler);
    // Protected routes
    fastify.get('/profile', {
        preHandler: [auth_1.requireCustomer]
    }, authController_1.profileHandler);
    fastify.put('/profile', {
        preHandler: [auth_1.requireCustomer]
    }, authController_1.updateProfileHandler);
    fastify.post('/logout', {
        preHandler: [auth_1.authenticateToken]
    }, authController_1.logoutHandler);
    fastify.get('/verify', {
        preHandler: [auth_1.authenticateToken]
    }, authController_1.verifyTokenHandler);
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
