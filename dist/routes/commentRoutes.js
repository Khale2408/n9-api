"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRoutes = commentRoutes;
const commentController_1 = require("../controllers/commentController");
const auth_1 = require("../middleware/auth");
async function commentRoutes(fastify) {
    fastify.post('/comments', { preHandler: [auth_1.requireCustomer] }, commentController_1.addCommentHandler);
}
