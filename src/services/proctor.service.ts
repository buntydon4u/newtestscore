import { prisma } from '../config/database.js';

export class ProctorService {
  async logEvent(data: {
    userId: string;
    attemptId?: string;
    eventType: string;
    severity: string;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.proctorEvent.create({
      data: {
        userId: data.userId,
        attemptId: data.attemptId,
        eventType: data.eventType,
        severity: data.severity,
        description: data.description
      }
    });
  }

  async getAttemptEvents(attemptId: string, filters: {
    page: number;
    limit: number;
    eventType?: string;
    severity?: string;
  }) {
    const where: any = { attemptId };
    
    if (filters.eventType) {
      where.eventType = filters.eventType;
    }

    if (filters.severity) {
      where.severity = filters.severity;
    }

    const [events, total] = await Promise.all([
      prisma.proctorEvent.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true
            }
          }
        },
        orderBy: { timestamp: 'desc' }
      }),
      prisma.proctorEvent.count({ where })
    ]);

    return {
      data: events,
      total,
      page: filters.page,
      limit: filters.limit
    };
  }

  async getExamEvents(examId: string, filters: {
    page: number;
    limit: number;
    eventType?: string;
    severity?: string;
  }) {
    // First get all attempts for this exam
    const attempts = await prisma.examAttempt.findMany({
      where: { examId },
      select: { id: true }
    });

    const attemptIds = attempts.map(a => a.id);

    const where: any = {
      attemptId: {
        in: attemptIds
      }
    };
    
    if (filters.eventType) {
      where.eventType = filters.eventType;
    }

    if (filters.severity) {
      where.severity = filters.severity;
    }

    const [events, total] = await Promise.all([
      prisma.proctorEvent.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true
            }
          }
        },
        orderBy: { timestamp: 'desc' }
      }),
      prisma.proctorEvent.count({ where })
    ]);

    return {
      data: events,
      total,
      page: filters.page,
      limit: filters.limit
    };
  }

  async getProctorSummary(examId: string, dateFrom?: Date, dateTo?: Date) {
    const where: any = {};
    
    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) where.timestamp.gte = dateFrom;
      if (dateTo) where.timestamp.lte = dateTo;
    }

    // Get attempts for this exam
    const attempts = await prisma.examAttempt.findMany({
      where: { examId },
      select: { id: true }
    });

    const attemptIds = attempts.map(a => a.id);

    where.attemptId = {
      in: attemptIds
    };

    const [summary, byType, bySeverity] = await Promise.all([
      prisma.proctorEvent.groupBy({
        by: ['severity'],
        where,
        _count: true
      }),
      prisma.proctorEvent.groupBy({
        by: ['eventType'],
        where,
        _count: true,
        orderBy: {
          _count: {
            eventType: 'desc'
          }
        },
        take: 10
      }),
      prisma.proctorEvent.groupBy({
        by: ['severity'],
        where: {
          ...where,
          severity: {
            in: ['HIGH', 'CRITICAL']
          }
        },
        _count: true
      })
    ]);

    // Get suspicious users
    const suspiciousUsers = await prisma.proctorEvent.groupBy({
      by: ['userId'],
      where: {
        ...where,
        severity: {
          in: ['HIGH', 'CRITICAL']
        }
      },
      _count: true,
      orderBy: {
        _count: {
          userId: 'desc'
        }
      },
      take: 10
    });

    return {
      totalEvents: summary.reduce((sum, s) => sum + s._count, 0),
      bySeverity: summary,
      topEventTypes: byType,
      criticalEvents: bySeverity.reduce((sum, s) => sum + s._count, 0),
      suspiciousUsers
    };
  }

  async getLiveSessions() {
    // Get attempts that are currently in progress
    const activeAttempts = await prisma.examAttempt.findMany({
      where: {
        status: 'IN_PROGRESS'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true
          }
        },
        exam: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Get recent proctoring events for these attempts
    const attemptIds = activeAttempts.map(a => a.id);
    
    const recentEvents = await prisma.proctorEvent.findMany({
      where: {
        attemptId: {
          in: attemptIds
        },
        timestamp: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Group events by attempt
    const eventsByAttempt = recentEvents.reduce((acc, event) => {
      if (!acc[event.attemptId!]) {
        acc[event.attemptId!] = [];
      }
      acc[event.attemptId!].push(event);
      return acc;
    }, {} as Record<string, any[]>);

    return activeAttempts.map(attempt => ({
      ...attempt,
      recentEvents: eventsByAttempt[attempt.id] || [],
      suspiciousCount: (eventsByAttempt[attempt.id] || []).filter(
        e => e.severity === 'HIGH' || e.severity === 'CRITICAL'
      ).length
    }));
  }

  async getSuspiciousEvents(page: number, limit: number, examId?: string) {
    const where: any = {
      severity: {
        in: ['HIGH', 'CRITICAL']
      }
    };

    if (examId) {
      const attempts = await prisma.examAttempt.findMany({
        where: { examId },
        select: { id: true }
      });
      where.attemptId = {
        in: attempts.map(a => a.id)
      };
    }

    const [events, total] = await Promise.all([
      prisma.proctorEvent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true
            }
          }
        },
        orderBy: { timestamp: 'desc' }
      }),
      prisma.proctorEvent.count({ where })
    ]);

    return {
      data: events,
      total,
      page,
      limit
    };
  }

  async flagEvent(eventId: string, reason: string, notes?: string, flaggedBy?: string) {
    // In a real implementation, you might have a separate table for flagged events
    // For now, we'll update the event with additional metadata
    return prisma.proctorEvent.update({
      where: { id: eventId },
      data: {
        description: `[FLAGGED] ${reason}${notes ? ` - ${notes}` : ''}`
      }
    });
  }

  async resolveEvent(eventId: string, resolution: string, notes?: string, resolvedBy?: string) {
    return prisma.proctorEvent.update({
      where: { id: eventId },
      data: {
        description: `[RESOLVED] ${resolution}${notes ? ` - ${notes}` : ''}`
      }
    });
  }

  async getRules() {
    // In a real implementation, you'd have a proctoring rules table
    // For now, return default rules
    return [
      {
        id: '1',
        name: 'Tab Switch Detection',
        description: 'Detect when user switches tabs during exam',
        eventType: 'TAB_SWITCH',
        condition: 'count > 3',
        action: 'FLAG',
        severity: 'MEDIUM',
        isActive: true
      },
      {
        id: '2',
        name: 'Face Not Detected',
        description: 'Alert when face is not visible',
        eventType: 'FACE_NOT_DETECTED',
        condition: 'duration > 30',
        action: 'FLAG',
        severity: 'HIGH',
        isActive: true
      },
      {
        id: '3',
        name: 'Multiple Faces',
        description: 'Detect multiple faces in camera',
        eventType: 'MULTIPLE_FACES',
        condition: 'count > 1',
        action: 'FLAG',
        severity: 'CRITICAL',
        isActive: true
      },
      {
        id: '4',
        name: 'Copy/Paste Attempt',
        description: 'Detect copy or paste attempts',
        eventType: 'COPY_PASTE',
        condition: 'any',
        action: 'FLAG',
        severity: 'HIGH',
        isActive: true
      },
      {
        id: '5',
        name: 'Window Focus Loss',
        description: 'Detect when exam window loses focus',
        eventType: 'WINDOW_FOCUS_LOSS',
        condition: 'count > 2',
        action: 'FLAG',
        severity: 'MEDIUM',
        isActive: true
      }
    ];
  }

  async createRule(data: {
    name: string;
    description: string;
    eventType: string;
    condition: string;
    action: string;
    severity: string;
  }, createdBy?: string) {
    // In a real implementation, you'd save to a proctoring rules table
    return {
      id: new Date().getTime().toString(),
      ...data,
      isActive: true,
      createdAt: new Date(),
      createdBy
    };
  }

  async updateRule(id: string, data: {
    name?: string;
    description?: string;
    condition?: string;
    action?: string;
    severity?: string;
  }, updatedBy?: string) {
    // In a real implementation, you'd update the proctoring rules table
    return {
      id,
      ...data,
      updatedAt: new Date(),
      updatedBy
    };
  }

  async deleteRule(id: string, deletedBy?: string) {
    // In a real implementation, you'd soft delete or mark as inactive
    return { id, deleted: true, deletedBy };
  }

  async getEventTypes() {
    return [
      { type: 'TAB_SWITCH', description: 'User switched to another tab' },
      { type: 'FACE_NOT_DETECTED', description: 'Face not visible in camera' },
      { type: 'MULTIPLE_FACES', description: 'Multiple faces detected' },
      { type: 'MICROPHONE_MUTED', description: 'Microphone is muted' },
      { type: 'BACKGROUND_NOISE', description: 'Background noise detected' },
      { type: 'WINDOW_FOCUS_LOSS', description: 'Exam window lost focus' },
      { type: 'COPY_PASTE', description: 'Copy or paste attempt detected' },
      { type: 'RIGHT_CLICK', description: 'Right click attempt detected' },
      { type: 'KEYBOARD_SHORTCUT', description: 'Keyboard shortcut detected' },
      { type: 'MOUSE_LEAVE_WINDOW', description: 'Mouse left exam window' }
    ];
  }

  async getProctorDashboard(examId?: string) {
    const [liveSessions, suspiciousEvents, summary] = await Promise.all([
      this.getLiveSessions(),
      this.getSuspiciousEvents(1, 5, examId),
      examId ? this.getProctorSummary(examId) : null
    ]);

    return {
      liveSessions: liveSessions.length,
      suspiciousEvents: suspiciousEvents.total,
      recentSessions: liveSessions.slice(0, 5),
      recentSuspiciousEvents: suspiciousEvents.data,
      summary
    };
  }

  async getStudentProctoring(userId: string, examId?: string) {
    const where: any = { userId };
    
    if (examId) {
      const attempts = await prisma.examAttempt.findMany({
        where: { examId },
        select: { id: true }
      });
      where.attemptId = {
        in: attempts.map(a => a.id)
      };
    }

    const events = await prisma.proctorEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    const summary = await prisma.proctorEvent.groupBy({
      by: ['severity'],
      where,
      _count: true
    });

    return {
      events,
      summary: {
        total: summary.reduce((sum, s) => sum + s._count, 0),
        bySeverity: summary
      }
    };
  }

  async bulkFlagEvents(eventIds: string[], reason: string, notes?: string, flaggedBy?: string) {
    const results = [];

    for (const eventId of eventIds) {
      try {
        const result = await this.flagEvent(eventId, reason, notes, flaggedBy);
        results.push(result);
      } catch (error) {
        console.error(`Failed to flag event ${eventId}:`, error);
      }
    }

    return results;
  }

  async exportProctorReport(
    examId: string,
    format: string = 'json',
    dateFrom?: Date,
    dateTo?: Date
  ) {
    const events = await this.getExamEvents(examId, {
      page: 1,
      limit: 10000 // Large limit for export
    });

    if (format === 'csv') {
      const headers = ['Timestamp', 'User', 'Event Type', 'Severity', 'Description'];
      const rows = events.data.map(event => [
        event.timestamp.toISOString(),
        event.user?.email || '',
        event.eventType,
        event.severity,
        event.description || ''
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return events;
  }
}

export const proctorService = new ProctorService();
