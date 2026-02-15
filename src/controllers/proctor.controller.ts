import { Request, Response } from 'express';
import { proctorService } from '../services/proctor.service.js';
import { auditService } from '../services/audit.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

export class ProctorController {
  async logEvent(req: AuthRequest, res: Response) {
    const { userId, attemptId, eventType, severity, description } = req.body;
    
    const data = await proctorService.logEvent({
      userId: userId || req.user!.userId,
      attemptId,
      eventType,
      severity,
      description,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PROCTOR_EVENT_LOG',
      entity: 'PROCTOR_EVENT',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json(data);
  }

  async getAttemptEvents(req: Request, res: Response) {
    const { id } = req.params;
    const { page = 1, limit = 50, eventType, severity } = req.query;
    
    const data = await proctorService.getAttemptEvents(
      id,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        eventType: eventType as string,
        severity: severity as string
      }
    );

    res.json(data);
  }

  async getExamEvents(req: Request, res: Response) {
    const { examId } = req.params;
    const { page = 1, limit = 50, eventType, severity } = req.query;
    
    const data = await proctorService.getExamEvents(
      examId,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        eventType: eventType as string,
        severity: severity as string
      }
    );

    res.json(data);
  }

  async getProctorSummary(req: Request, res: Response) {
    const { examId } = req.params;
    const { dateFrom, dateTo } = req.query;
    
    const data = await proctorService.getProctorSummary(
      examId,
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    res.json(data);
  }

  async getLiveSessions(req: Request, res: Response) {
    const data = await proctorService.getLiveSessions();

    res.json(data);
  }

  async getSuspiciousEvents(req: Request, res: Response) {
    const { page = 1, limit = 20, examId } = req.query;
    
    const data = await proctorService.getSuspiciousEvents(
      parseInt(page as string),
      parseInt(limit as string),
      examId as string
    );

    res.json(data);
  }

  async flagEvent(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { reason, notes } = req.body;
    
    const data = await proctorService.flagEvent(
      id,
      reason,
      notes,
      req.user!.userId
    );

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PROCTOR_EVENT_FLAG',
      entity: 'PROCTOR_EVENT',
      entityId: id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async resolveEvent(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { resolution, notes } = req.body;
    
    const data = await proctorService.resolveEvent(
      id,
      resolution,
      notes,
      req.user!.userId
    );

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PROCTOR_EVENT_RESOLVE',
      entity: 'PROCTOR_EVENT',
      entityId: id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async getRules(req: Request, res: Response) {
    const data = await proctorService.getRules();

    res.json(data);
  }

  async createRule(req: AuthRequest, res: Response) {
    const { name, description, eventType, condition, action, severity } = req.body;
    
    const data = await proctorService.createRule({
      name,
      description,
      eventType,
      condition,
      action,
      severity
    }, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PROCTOR_RULE_CREATE',
      entity: 'PROCTOR_RULE',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json(data);
  }

  async updateRule(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { name, description, condition, action, severity } = req.body;
    
    const data = await proctorService.updateRule(
      id,
      { name, description, condition, action, severity },
      req.user!.userId
    );

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PROCTOR_RULE_UPDATE',
      entity: 'PROCTOR_RULE',
      entityId: id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async deleteRule(req: AuthRequest, res: Response) {
    const { id } = req.params;
    
    await proctorService.deleteRule(id, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PROCTOR_RULE_DELETE',
      entity: 'PROCTOR_RULE',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({ message: 'Proctoring rule deleted successfully' });
  }

  async getEventTypes(req: Request, res: Response) {
    const data = await proctorService.getEventTypes();

    res.json(data);
  }

  async getProctorDashboard(req: Request, res: Response) {
    const { examId } = req.query;
    
    const data = await proctorService.getProctorDashboard(examId as string);

    res.json(data);
  }

  async getStudentProctoring(req: Request, res: Response) {
    const { userId } = req.params;
    const { examId } = req.query;
    
    const data = await proctorService.getStudentProctoring(
      userId,
      examId as string
    );

    res.json(data);
  }

  async bulkFlagEvents(req: AuthRequest, res: Response) {
    const { eventIds, reason, notes } = req.body;
    
    const data = await proctorService.bulkFlagEvents(
      eventIds,
      reason,
      notes,
      req.user!.userId
    );

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PROCTOR_EVENTS_BULK_FLAG',
      entity: 'PROCTOR_EVENT',
      newValues: { count: eventIds.length },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      message: `Flagged ${data.length} events successfully`,
      data
    });
  }

  async exportProctorReport(req: Request, res: Response) {
    const { examId } = req.params;
    const { format = 'json', dateFrom, dateTo } = req.query;
    
    const data = await proctorService.exportProctorReport(
      examId,
      format as string,
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="proctor-report-${examId}.csv"`);
      res.send(data);
    } else {
      res.json(data);
    }
  }
}
