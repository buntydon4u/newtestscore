import { Request, Response } from 'express';
import { examSectionService } from '../services/examSection.service.js';
import { auditService } from '../services/audit.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { cacheDeletePattern } from '../redis/cacheWrap.js';

export class ExamSectionController {
  async createSection(req: AuthRequest, res: Response) {
    const { examId } = req.params;
    const data = await examSectionService.createSection(examId, req.body, req.user!.userId);

    if (!data) {
      throw new AppError(500, 'Failed to create section');
    }

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'EXAM_SECTION_CREATE',
      entity: 'SECTION',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:exam:*');

    res.status(201).json(data);
  }

  async updateSection(req: AuthRequest, res: Response) {
    const { examId, sectionId } = req.params;
    const oldData = await examSectionService.getSectionById(sectionId);

    if (!oldData) {
      throw new AppError(404, 'Section not found');
    }

    const data = await examSectionService.updateSection(sectionId, req.body, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'EXAM_SECTION_UPDATE',
      entity: 'SECTION',
      entityId: sectionId,
      oldValues: oldData,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:exam:*');

    res.json(data);
  }

  async deleteSection(req: AuthRequest, res: Response) {
    const { examId, sectionId } = req.params;
    const oldData = await examSectionService.getSectionById(sectionId);

    if (!oldData) {
      throw new AppError(404, 'Section not found');
    }

    await examSectionService.deleteSection(sectionId, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'EXAM_SECTION_DELETE',
      entity: 'SECTION',
      entityId: sectionId,
      oldValues: oldData,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:exam:*');

    res.json({ message: 'Section deleted successfully' });
  }

  async assignQuestions(req: AuthRequest, res: Response) {
    const { examId, sectionId } = req.params;
    const { questions } = req.body;

    const data = await examSectionService.assignQuestions(sectionId, questions, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'EXAM_QUESTION_ASSIGN',
      entity: 'EXAM_QUESTION',
      newValues: { sectionId, count: questions.length },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:exam:*');

    res.status(201).json({
      message: `Assigned ${questions.length} questions to section`,
      data
    });
  }

  async updateQuestionAssignment(req: AuthRequest, res: Response) {
    const { examId, sectionId, questionId } = req.params;
    const oldData = await examSectionService.getQuestionAssignment(questionId, sectionId);

    if (!oldData) {
      throw new AppError(404, 'Question assignment not found');
    }

    const data = await examSectionService.updateQuestionAssignment(
      questionId,
      sectionId,
      req.body,
      req.user!.userId
    );

    if (!data) {
      throw new AppError(404, 'Question assignment not found');
    }

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'EXAM_QUESTION_UPDATE',
      entity: 'EXAM_QUESTION',
      entityId: data.id,
      oldValues: oldData,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:exam:*');

    res.json(data);
  }

  async removeQuestion(req: AuthRequest, res: Response) {
    const { examId, sectionId, questionId } = req.params;
    
    await examSectionService.removeQuestion(questionId, sectionId, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'EXAM_QUESTION_REMOVE',
      entity: 'EXAM_QUESTION',
      oldValues: { questionId, sectionId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:exam:*');

    res.json({ message: 'Question removed from section successfully' });
  }

  async getSectionQuestions(req: Request, res: Response) {
    const { examId, sectionId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const questions = await examSectionService.getSectionQuestions(
      sectionId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(questions);
  }

  async reorderQuestions(req: AuthRequest, res: Response) {
    const { examId, sectionId } = req.params;
    const { questionOrders } = req.body;

    await examSectionService.reorderQuestions(sectionId, questionOrders, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'EXAM_QUESTION_REORDER',
      entity: 'EXAM_QUESTION',
      newValues: { sectionId, count: questionOrders.length },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:exam:*');

    res.json({ message: 'Questions reordered successfully' });
  }

  async getExamStructure(req: Request, res: Response) {
    const { examId } = req.params;
    const structure = await examSectionService.getExamStructure(examId);

    res.json(structure);
  }

  async duplicateSection(req: AuthRequest, res: Response) {
    const { examId, sectionId } = req.params;
    const { name } = req.body;

    const data = await examSectionService.duplicateSection(sectionId, name, req.user!.userId);

    if (!data) {
      throw new AppError(500, 'Failed to duplicate section');
    }

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'EXAM_SECTION_DUPLICATE',
      entity: 'SECTION',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:exam:*');

    res.status(201).json(data);
  }
}
