"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = userRoutes;
const auth_1 = require("../middleware/auth");
async function userRoutes(fastify) {
    fastify.get('/me', {
        preHandler: [auth_1.authMiddleware],
        schema: {
            description: 'Get current user profile',
            tags: ['users'],
            security: [{ cookieAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                username: { type: 'string' },
                                email: { type: 'string' },
                                fullName: { type: 'string' },
                                role: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const user = request.user;
            return {
                user: {
                    id: user.userId,
                    username: user.username,
                    role: user.role,
                },
            };
        }
        catch (error) {
            console.error('Get user profile error:', error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to fetch user profile',
            });
        }
    });
}
//# sourceMappingURL=users.js.map