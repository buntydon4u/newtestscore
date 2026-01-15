import { Request, Response, NextFunction } from 'express';
interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    message?: string;
}
export declare function createRateLimiter(config?: Partial<RateLimitConfig>): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const apiLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const signupLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const rateLimit: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=rateLimit.d.ts.map