import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare class SectionController {
    list(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    softDelete(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=section.controller.d.ts.map