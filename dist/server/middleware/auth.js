"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
async function authMiddleware(request, reply) {
    try {
        const token = request.cookies.access_token;
        if (!token) {
            return reply.status(401).send({
                error: 'No access token',
                message: 'Access token is required',
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET);
        request.user = {
            userId: decoded.userId,
            username: decoded.username,
            role: decoded.role,
        };
    }
    catch (error) {
        return reply.status(401).send({
            error: 'Invalid token',
            message: 'Access token is invalid or expired',
        });
    }
}
//# sourceMappingURL=auth.js.map