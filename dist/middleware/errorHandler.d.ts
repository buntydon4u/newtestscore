import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    message: string;
    errors?: Record<string, any> | undefined;
    constructor(statusCode: number, message: string, errors?: Record<string, any> | undefined);
}
export declare function errorHandler(error: Error | AppError, req: Request, res: Response, next: NextFunction): void;
export declare function notFoundHandler(req: Request, res: Response): void;
export declare function asyncHandler(fn: Function): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map