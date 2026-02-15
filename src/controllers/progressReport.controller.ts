import { Request, Response } from 'express';
import { progressReportService } from '../services/progressReport.service.js';
import { auditService } from '../services/audit.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

export class ProgressReportController {
  async getReports(req: Request, res: Response) {
    const { userId } = req.params;
    const { page = 1, limit = 10, reportPeriod } = req.query;
    
    const data = await progressReportService.getReports(
      userId || req.user!.userId,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        reportPeriod: reportPeriod as string
      }
    );

    res.json(data);
  }

  async generateReport(req: AuthRequest, res: Response) {
    const { userId } = req.params;
    const { reportPeriod, periodStart, periodEnd } = req.body;
    
    const data = await progressReportService.generateReport(
      userId || req.user!.userId,
      {
        reportPeriod,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd)
      },
      req.user!.userId
    );

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PROGRESS_REPORT_GENERATE',
      entity: 'PROGRESS_REPORT',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json(data);
  }

  async getReport(req: Request, res: Response) {
    const { id } = req.params;
    const data = await progressReportService.getReport(id, req.user?.userId);

    if (!data) {
      throw new AppError(404, 'Report not found');
    }

    res.json(data);
  }

  async getWeeklyProgress(req: Request, res: Response) {
    const { userId } = req.params;
    const data = await progressReportService.getWeeklyProgress(userId || req.user!.userId);

    res.json(data);
  }

  async getMonthlyProgress(req: Request, res: Response) {
    const { userId } = req.params;
    const data = await progressReportService.getMonthlyProgress(userId || req.user!.userId);

    res.json(data);
  }

  async getSubjectWiseProgress(req: Request, res: Response) {
    const { userId } = req.params;
    const { subject } = req.query;
    
    const data = await progressReportService.getSubjectWiseProgress(
      userId || req.user!.userId,
      subject as string
    );

    res.json(data);
  }

  async getOverallProgress(req: Request, res: Response) {
    const { userId } = req.params;
    const data = await progressReportService.getOverallProgress(userId || req.user!.userId);

    res.json(data);
  }

  async getProgressChart(req: Request, res: Response) {
    const { userId } = req.params;
    const { period = 'monthly', months = 6 } = req.query;
    
    const data = await progressReportService.getProgressChart(
      userId || req.user!.userId,
      period as string,
      parseInt(months as string)
    );

    res.json(data);
  }

  async compareProgress(req: Request, res: Response) {
    const { userId } = req.params;
    const { compareUserId, period = 'monthly' } = req.query;
    
    if (!compareUserId) {
      throw new AppError(400, 'Compare user ID is required');
    }

    const data = await progressReportService.compareProgress(
      userId || req.user!.userId,
      compareUserId as string,
      period as string
    );

    res.json(data);
  }

  async getStrengthsAndImprovements(req: Request, res: Response) {
    const { userId } = req.params;
    const data = await progressReportService.getStrengthsAndImprovements(userId || req.user!.userId);

    res.json(data);
  }

  async updateReport(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { strengths, improvements, recommendations } = req.body;
    
    const data = await progressReportService.updateReport(
      id,
      { strengths, improvements, recommendations },
      req.user!.userId
    );

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PROGRESS_REPORT_UPDATE',
      entity: 'PROGRESS_REPORT',
      entityId: id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async deleteReport(req: AuthRequest, res: Response) {
    const { id } = req.params;
    
    await progressReportService.deleteReport(id, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PROGRESS_REPORT_DELETE',
      entity: 'PROGRESS_REPORT',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({ message: 'Report deleted successfully' });
  }

  async generateBulkReports(req: AuthRequest, res: Response) {
    const { userIds, reportPeriod, periodStart, periodEnd } = req.body;
    
    const data = await progressReportService.generateBulkReports(
      userIds,
      {
        reportPeriod,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd)
      },
      req.user!.userId
    );

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PROGRESS_REPORT_BULK_GENERATE',
      entity: 'PROGRESS_REPORT',
      newValues: { count: data.length },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      message: `Generated ${data.length} reports successfully`,
      data
    });
  }
}
