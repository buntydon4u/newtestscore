import { Request, Response, NextFunction } from 'express';
export declare const cacheMiddleware: (entityName: string, ttl?: number) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=cacheMiddleware.d.ts.map