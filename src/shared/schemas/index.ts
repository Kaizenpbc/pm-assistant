import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const UserSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().min(2),
    role: z.enum(['admin', 'user']),
});

export type LoginInput = z.infer<typeof LoginSchema>;
