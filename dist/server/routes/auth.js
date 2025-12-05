"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const UserService_1 = require("../services/UserService");
const loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, 'Username must be at least 3 characters'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
const registerSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, 'Username must be at least 3 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters'),
});
async function authRoutes(fastify) {
    const userService = new UserService_1.UserService();
    fastify.post('/login', {
        schema: {
            description: 'User login with HttpOnly cookies',
            tags: ['auth'],
            body: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                    username: { type: 'string', minLength: 3 },
                    password: { type: 'string', minLength: 6 },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
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
                401: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const { username, password } = loginSchema.parse(request.body);
            const user = await userService.findByUsername(username);
            if (!user) {
                return reply.status(401).send({
                    error: 'Invalid credentials',
                    message: 'Username or password is incorrect',
                });
            }
            const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!isValidPassword) {
                return reply.status(401).send({
                    error: 'Invalid credentials',
                    message: 'Username or password is incorrect',
                });
            }
            const accessToken = jsonwebtoken_1.default.sign({
                userId: user.id,
                username: user.username,
                role: user.role
            }, config_1.config.JWT_SECRET, { expiresIn: '15m' });
            const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id, type: 'refresh' }, config_1.config.JWT_REFRESH_SECRET, { expiresIn: '7d' });
            reply.setCookie('access_token', accessToken, {
                httpOnly: true,
                secure: config_1.config.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 15 * 60 * 1000,
            });
            reply.setCookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: config_1.config.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return {
                message: 'Login successful',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                },
            };
        }
        catch (error) {
            console.error('Login error:', error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Login failed',
            });
        }
    });
    fastify.post('/register', {
        schema: {
            description: 'User registration',
            tags: ['auth'],
            body: {
                type: 'object',
                required: ['username', 'email', 'password', 'fullName'],
                properties: {
                    username: { type: 'string', minLength: 3 },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    fullName: { type: 'string', minLength: 2 },
                },
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
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
            const { username, email, password, fullName } = registerSchema.parse(request.body);
            const existingUser = await userService.findByUsername(username);
            if (existingUser) {
                return reply.status(409).send({
                    error: 'User already exists',
                    message: 'Username is already taken',
                });
            }
            const passwordHash = await bcryptjs_1.default.hash(password, 12);
            const user = await userService.create({
                username,
                email,
                passwordHash,
                fullName,
                role: 'user',
            });
            return reply.status(201).send({
                message: 'User created successfully',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                },
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Registration failed',
            });
        }
    });
    fastify.post('/logout', {
        schema: {
            description: 'User logout - clears cookies',
            tags: ['auth'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        reply.clearCookie('access_token');
        reply.clearCookie('refresh_token');
        return {
            message: 'Logout successful',
        };
    });
    fastify.post('/refresh', {
        schema: {
            description: 'Refresh access token using refresh token',
            tags: ['auth'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const refreshToken = request.cookies.refresh_token;
            if (!refreshToken) {
                return reply.status(401).send({
                    error: 'No refresh token',
                    message: 'Refresh token is required',
                });
            }
            const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.config.JWT_REFRESH_SECRET);
            if (decoded.type !== 'refresh') {
                return reply.status(401).send({
                    error: 'Invalid token type',
                    message: 'Token is not a refresh token',
                });
            }
            const user = await userService.findById(decoded.userId);
            if (!user) {
                return reply.status(401).send({
                    error: 'User not found',
                    message: 'User associated with token not found',
                });
            }
            const accessToken = jsonwebtoken_1.default.sign({
                userId: user.id,
                username: user.username,
                role: user.role
            }, config_1.config.JWT_SECRET, { expiresIn: '15m' });
            reply.setCookie('access_token', accessToken, {
                httpOnly: true,
                secure: config_1.config.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000,
            });
            return {
                message: 'Token refreshed successfully',
            };
        }
        catch (error) {
            console.error('Token refresh error:', error);
            return reply.status(401).send({
                error: 'Invalid refresh token',
                message: 'Refresh token is invalid or expired',
            });
        }
    });
}
//# sourceMappingURL=auth.js.map