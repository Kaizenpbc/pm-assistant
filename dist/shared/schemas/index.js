"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(2),
    role: zod_1.z.enum(['admin', 'user']),
});
//# sourceMappingURL=index.js.map