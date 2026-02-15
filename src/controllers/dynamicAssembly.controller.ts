import { Request, Response } from 'express';
import { dynamicAssemblyService } from '../services/dynamicAssembly.service.js';
import { auditService } from '../services/audit.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

export class DynamicAssemblyController {
  async generatePaper(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { seed, deliveryType = 'FULL' } = req.body;
    
    const data = await dynamicAssemblyService.generatePaper(
      id,
      seed,
      deliveryType,
      req.user!.userId
    );

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PAPER_GENERATE',
      entity: 'EXAM',
      entityId: id,
      newValues: { seed, deliveryType },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async getGeneratedPaper(req: Request, res: Response) {
    const { id } = req.params;
    const data = await dynamicAssemblyService.getGeneratedPaper(id, req.user?.userId);

    if (!data) {
      throw new AppError(404, 'Generated paper not found');
    }

    res.json(data);
  }

  async generateQuestionsForAttempt(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { blueprintId, seed, sectionId } = req.body;
    
    const data = await dynamicAssemblyService.generateQuestionsForAttempt(
      id,
      blueprintId,
      seed,
      sectionId,
      req.user!.userId
    );

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'QUESTIONS_GENERATE',
      entity: 'EXAM_ATTEMPT',
      entityId: id,
      newValues: { blueprintId, seed },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async getTaxonomy(req: Request, res: Response) {
    const { type } = req.query;
    
    const data = await dynamicAssemblyService.getTaxonomy(type as string);

    res.json(data);
  }

  async validateBlueprint(req: Request, res: Response) {
    const { id } = req.params;
    
    const validation = await dynamicAssemblyService.validateBlueprint(id);

    res.json(validation);
  }

  async previewQuestions(req: Request, res: Response) {
    const { id } = req.params;
    const { limit = 10, seed } = req.query;
    
    const data = await dynamicAssemblyService.previewQuestions(
      id,
      parseInt(limit as string),
      seed as string
    );

    res.json(data);
  }

  async generateAdaptiveQuestions(req: AuthRequest, res: Response) {
    const { attemptId, sectionId } = req.params;
    const { difficulty, performance } = req.body;
    
    const data = await dynamicAssemblyService.generateAdaptiveQuestions(
      attemptId,
      sectionId,
      difficulty,
      performance,
      req.user!.userId
    );

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'ADAPTIVE_QUESTIONS_GENERATE',
      entity: 'EXAM_ATTEMPT',
      entityId: attemptId,
      newValues: { difficulty, performance },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async getQuestionPool(req: Request, res: Response) {
    const { examId } = req.params;
    const { topicId, difficulty, questionType, tags } = req.query;
    
    const data = await dynamicAssemblyService.getQuestionPool(
      examId,
      {
        topicId: topicId as string,
        difficulty: difficulty as string,
        questionType: questionType as string,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) as string[] : undefined
      }
    );

    res.json(data);
  }

  async shuffleQuestions(req: AuthRequest, res: Response) {
    const { examId } = req.params;
    const { seed, sectionId } = req.body;
    
    const data = await dynamicAssemblyService.shuffleQuestions(
      examId,
      seed,
      sectionId,
      req.user!.userId
    );

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'QUESTIONS_SHUFFLE',
      entity: 'EXAM',
      entityId: examId,
      newValues: { seed, sectionId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async getDeliveryTypes(req: Request, res: Response) {
    const data = await dynamicAssemblyService.getDeliveryTypes();

    res.json(data);
  }

  async generateSectionWise(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { sections, seed } = req.body;
    
    const data = await dynamicAssemblyService.generateSectionWise(
      id,
      sections,
      seed,
      req.user!.userId
    );

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'SECTION_WISE_GENERATE',
      entity: 'EXAM',
      entityId: id,
      newValues: { sections, seed },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async generatePracticePaper(req: AuthRequest, res: Response) {
    const { blueprintId } = req.params;
    const { userId, difficulty, topics } = req.body;
    
    const data = await dynamicAssemblyService.generatePracticePaper(
      blueprintId,
      userId || req.user!.userId,
      difficulty,
      topics,
      req.user!.userId
    );

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PRACTICE_PAPER_GENERATE',
      entity: 'EXAM_BLUEPRINT',
      entityId: blueprintId,
      newValues: { difficulty, topics },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async analyzeQuestionDistribution(req: Request, res: Response) {
    const { blueprintId } = req.params;
    
    const data = await dynamicAssemblyService.analyzeQuestionDistribution(blueprintId);

    res.json(data);
  }

  async optimizeBlueprint(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { constraints } = req.body;
    
    const data = await dynamicAssemblyService.optimizeBlueprint(
      id,
      constraints,
      req.user!.userId
    );

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'BLUEPRINT_OPTIMIZE',
      entity: 'EXAM_BLUEPRINT',
      entityId: id,
      newValues: constraints,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async validateQuestionPool(req: Request, res: Response) {
    const { blueprintId } = req.params;
    
    const validation = await dynamicAssemblyService.validateQuestionPool(blueprintId);

    res.json(validation);
  }

  async getSimilarQuestions(req: Request, res: Response) {
    const { questionId } = req.params;
    const { limit = 5 } = req.query;
    
    const data = await dynamicAssemblyService.getSimilarQuestions(
      questionId,
      parseInt(limit as string)
    );

    res.json(data);
  }

  async generateVariations(req: AuthRequest, res: Response) {
    const { questionId } = req.params;
    const { count = 3, difficulty } = req.body;
    
    const data = await dynamicAssemblyService.generateQuestionVariations(
      questionId,
      count,
      difficulty,
      req.user!.userId
    );

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'QUESTION_VARIATIONS_GENERATE',
      entity: 'QUESTION',
      entityId: questionId,
      newValues: { count, difficulty },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }
}
