import { Request, Response, NextFunction } from 'express';
export interface AuditRequest extends Request {
    auditId?: string;
    auditStartTime?: number;
}
export declare function auditMiddleware(req: AuditRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=audit.d.ts.map