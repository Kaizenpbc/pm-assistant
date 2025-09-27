import { FastifyRequest, FastifyReply } from 'fastify';
export declare function securityMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function securityValidationMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function createRateLimitMiddleware(max: number, timeWindow: string): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
//# sourceMappingURL=securityMiddleware.d.ts.map