import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare class ExamController {
    list(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    uploadQuestions(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    softDelete(req: AuthRequest, res: Response): Promise<void>;
    getBoards(req: Request, res: Response): Promise<void>;
    getSeries(req: Request, res: Response): Promise<void>;
    getClasses(req: Request, res: Response): Promise<void>;
    getBlueprints(req: Request, res: Response): Promise<void>;
    getAcademicBoards(req: Request, res: Response): Promise<void>;
    createBoard(req: AuthRequest, res: Response): Promise<void>;
    createSeries(req: AuthRequest, res: Response): Promise<void>;
    createClass(req: AuthRequest, res: Response): Promise<void>;
    createBlueprint(req: AuthRequest, res: Response): Promise<void>;
    createAcademicBoard(req: AuthRequest, res: Response): Promise<void>;
    listSchedules(req: Request, res: Response): Promise<void>;
    createSchedule(req: AuthRequest, res: Response): Promise<void>;
    enroll(req: AuthRequest, res: Response): Promise<void>;
    cancelEnrollment(req: AuthRequest, res: Response): Promise<void>;
    myEnrollments(req: AuthRequest, res: Response): Promise<void>;
    listEnrollments(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=exam.controller.d.ts.map