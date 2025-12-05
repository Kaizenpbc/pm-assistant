import { z } from 'zod';
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    role: z.ZodEnum<{
        admin: "admin";
        user: "user";
    }>;
}, z.core.$strip>;
export type LoginInput = z.infer<typeof LoginSchema>;
//# sourceMappingURL=index.d.ts.map