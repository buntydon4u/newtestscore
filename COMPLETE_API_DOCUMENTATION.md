# Complete API Documentation - Exam System

This document contains all implemented APIs for the exam system across all phases.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints require JWT authentication (except login/signup). Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Phase 3 – Question Bank & Exam Structure APIs

### Question Bank Management
- `GET /api/question-banks` - List all question banks (Admin, Super Admin, Teacher)
- `POST /api/question-banks` - Create a new question bank (Admin, Super Admin, Teacher)
- `GET /api/question-banks/:id` - Get question bank details (Admin, Super Admin, Teacher)
- `PUT /api/question-banks/:id` - Update question bank (Admin, Super Admin, Teacher)
- `DELETE /api/question-banks/:id` - Delete question bank (Admin, Super Admin)
- `GET /api/question-banks/:id/questions` - Get questions in a bank (Admin, Super Admin, Teacher)

### Question Management
- `GET /api/questions` - List questions with filters (Admin, Super Admin, Teacher)
- `POST /api/questions` - Create a new question (Admin, Super Admin, Teacher)
- `GET /api/questions/:id` - Get question details (Admin, Super Admin, Teacher)
- `PUT /api/questions/:id` - Update question (Admin, Super Admin, Teacher)
- `DELETE /api/questions/:id` - Delete question (Admin, Super Admin)
- `POST /api/questions/:id/options` - Add question option (Admin, Super Admin, Teacher)
- `PUT /api/questions/:id/options/:optionId` - Update option (Admin, Super Admin, Teacher)
- `DELETE /api/questions/:id/options/:optionId` - Delete option (Admin, Super Admin)
- `POST /api/questions/bulk` - Bulk create questions (Admin, Super Admin, Teacher)

### Tag Management
- `GET /api/tags` - List all tags
- `POST /api/tags` - Create a new tag (Admin, Super Admin, Teacher)
- `GET /api/tags/:id` - Get tag details
- `PUT /api/tags/:id` - Update tag (Admin, Super Admin, Teacher)
- `DELETE /api/tags/:id` - Delete tag (Admin, Super Admin)
- `POST /api/tags/questions/:questionId/tag` - Tag a question (Admin, Super Admin, Teacher)
- `DELETE /api/tags/questions/:questionId/tags/:tagId` - Remove tag from question (Admin, Super Admin, Teacher)
- `GET /api/tags/questions/:questionId/tags` - Get question tags
- `GET /api/tags/popular/list` - Get popular tags
- `GET /api/tags/taxonomy/view` - Get tag taxonomy

### Passage Management
- `GET /api/passages` - List passages (Admin, Super Admin, Teacher)
- `POST /api/passages` - Create a passage (Admin, Super Admin, Teacher)
- `GET /api/passages/:id` - Get passage details (Admin, Super Admin, Teacher)
- `PUT /api/passages/:id` - Update passage (Admin, Super Admin, Teacher)
- `DELETE /api/passages/:id` - Delete passage (Admin, Super Admin)
- `GET /api/passages/:id/questions` - Get questions in a passage (Admin, Super Admin, Teacher)

### Media Asset Management
- `GET /api/media` - List media assets (Admin, Super Admin, Teacher)
- `POST /api/media/upload` - Upload media file (Admin, Super Admin, Teacher)
- `POST /api/media/upload-multiple` - Upload multiple files (Admin, Super Admin, Teacher)
- `GET /api/media/:id` - Get media asset details
- `PUT /api/media/:id` - Update media asset (Admin, Super Admin, Teacher)
- `DELETE /api/media/:id` - Delete media asset (Admin, Super Admin)
- `GET /api/media/:id/serve` - Serve media file

### Exam Builder
- `POST /api/exams/:examId/sections` - Add section to exam (Admin, Super Admin, Teacher)
- `PUT /api/exams/:examId/sections/:sectionId` - Update section (Admin, Super Admin, Teacher)
- `DELETE /api/exams/:examId/sections/:sectionId` - Delete section (Admin, Super Admin)
- `POST /api/exams/:examId/sections/:sectionId/questions` - Assign questions to section (Admin, Super Admin, Teacher)
- `PUT /api/exams/:examId/sections/:sectionId/questions/:questionId` - Update question assignment (Admin, Super Admin, Teacher)
- `DELETE /api/exams/:examId/sections/:sectionId/questions/:questionId` - Remove question from section (Admin, Super Admin)
- `GET /api/exams/:examId/sections/:sectionId/questions` - Get section questions (All roles)
- `POST /api/exams/:examId/sections/:sectionId/reorder` - Reorder questions (Admin, Super Admin, Teacher)
- `GET /api/exams/:examId/structure` - Get exam structure (All roles)
- `POST /api/exams/:examId/sections/:sectionId/duplicate` - Duplicate section (Admin, Super Admin, Teacher)

### Blueprint Management
- `GET /api/blueprints` - List blueprints (Admin, Super Admin, Teacher)
- `POST /api/blueprints` - Create blueprint (Admin, Super Admin, Teacher)
- `GET /api/blueprints/:id` - Get blueprint details (Admin, Super Admin, Teacher)
- `PUT /api/blueprints/:id` - Update blueprint (Admin, Super Admin, Teacher)
- `DELETE /api/blueprints/:id` - Delete blueprint (Admin, Super Admin)
- `POST /api/blueprints/:id/rules` - Add blueprint rule (Admin, Super Admin, Teacher)
- `PUT /api/blueprints/:id/rules/:ruleId` - Update blueprint rule (Admin, Super Admin, Teacher)
- `DELETE /api/blueprints/:id/rules/:ruleId` - Delete blueprint rule (Admin, Super Admin)
- `POST /api/blueprints/:id/validate` - Validate blueprint (Admin, Super Admin, Teacher)
- `GET /api/blueprints/:id/preview` - Preview questions from blueprint (Admin, Super Admin, Teacher)
- `POST /api/blueprints/:id/clone` - Clone blueprint (Admin, Super Admin, Teacher)
- `POST /api/blueprints/:id/generate-paper` - Generate paper from blueprint (Admin, Super Admin, Teacher)

---

## Phase 4 – Exam Attempts & Scoring APIs

### Exam Attempt Management
- `POST /api/exams/:examId/attempts` - Start new exam attempt (Student)
- `GET /api/attempts/:id` - Get attempt details
- `POST /api/attempts/:id/resume` - Resume paused attempt (Student)
- `POST /api/attempts/:id/submit` - Submit exam attempt (Student)
- `GET /api/attempts/:id/sections` - Get sections for attempt
- `POST /api/attempts/:id/sections/:sectionId/start` - Start a section (Student)
- `POST /api/attempts/:id/sections/:sectionId/submit` - Submit section (Student)
- `POST /api/attempts/:id/pause` - Pause attempt (Student)

### Answer Management
- `GET /api/attempts/:id/questions` - Get questions for attempt
- `POST /api/attempts/:id/questions/:questionId/answer` - Save answer (Student)
- `GET /api/attempts/:id/answers` - Get all answers for review
- `POST /api/attempts/:id/submit-all` - Submit all answers (Student)

### Time Management
- `GET /api/attempts/:id/time` - Get remaining time
- `POST /api/attempts/:id/time/update` - Update time tracking (Student)

### Scoring & Results
- `POST /api/attempts/:id/evaluate` - Evaluate attempt (Admin, Super Admin, Teacher)
- `GET /api/attempts/:id/score` - Get score details
- `GET /api/attempts/:id/results` - Get detailed results
- `GET /api/attempts/:id/section-scores` - Get section-wise scores
- `GET /api/users/:userId/attempts` - Get user's attempt history
- `GET /api/exams/:examId/results` - Get all results for exam (Admin, Super Admin, Teacher)
- `GET /api/exams/:examId/leaderboard` - Get exam leaderboard
- `GET /api/exams/:examId/statistics` - Get exam statistics (Admin, Super Admin, Teacher)

### Manual Grading
- `PUT /api/attempts/:attemptId/questions/:questionId/score` - Update manual score (Admin, Super Admin, Teacher)
- `POST /api/attempts/:attemptId/bulk-grade` - Bulk grade attempts (Admin, Super Admin, Teacher)
- `POST /api/attempts/:id/recompute` - Recpute score (Admin, Super Admin, Teacher)

---

## Phase 5 – Notifications & Progress Reporting APIs

### Notification Management
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification (Admin, Super Admin, Teacher)
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/unread/count` - Get unread count
- `POST /api/notifications/send-scheduled` - Send scheduled notifications (Admin, Super Admin)
- `POST /api/notifications/bulk` - Bulk create notifications (Admin, Super Admin, Teacher)
- `GET /api/notifications/type/:type` - Get notifications by type
- `GET /api/notifications/search` - Search notifications

### Progress Reports
- `GET /api/users/:userId/reports` - Get progress reports
- `POST /api/users/:userId/reports` - Generate new report (All roles)
- `GET /api/reports/:id` - Get specific report
- `PUT /api/reports/:id` - Update report (Admin, Super Admin, Teacher)
- `DELETE /api/reports/:id` - Delete report (Admin, Super Admin, Teacher)
- `GET /api/users/:userId/reports/weekly` - Get weekly progress
- `GET /api/users/:userId/reports/monthly` - Get monthly progress
- `GET /api/users/:userId/reports/subject-wise` - Get subject-wise progress
- `GET /api/users/:userId/reports/overall` - Get overall progress
- `GET /api/users/:userId/progress/chart` - Get progress chart
- `GET /api/users/:userId/progress/compare` - Compare progress with another user
- `GET /api/users/:userId/progress/strengths` - Get strengths and improvements
- `POST /api/reports/bulk` - Generate bulk reports (Admin, Super Admin, Teacher)

### Achievement System
- `GET /api/users/:userId/achievements` - Get user achievements
- `POST /api/achievements` - Award achievement (Admin, Super Admin, Teacher)
- `GET /api/users/:userId/achievements/unlocked` - Get unlocked achievements
- `GET /api/users/:userId/achievements/pending` - Get pending achievements
- `GET /api/achievements/:id` - Get achievement details
- `GET /api/achievements/leaderboard` - Get achievement leaderboard
- `GET /api/achievements/categories` - Get achievement categories
- `GET /api/users/:userId/achievements/stats` - Get achievement statistics
- `GET /api/users/:userId/achievements/recent` - Get recent achievements
- `GET /api/users/:userId/achievements/progress` - Get achievement progress
- `POST /api/users/:userId/achievements/check` - Check for new achievements
- `POST /api/achievements/:id/share` - Share achievement
- `POST /api/milestones` - Create milestone (Admin, Super Admin, Teacher)
- `GET /api/users/:userId/milestones` - Get user milestones

---

## Phase 10 – Proctoring & Security APIs

### Proctor Event Management
- `POST /api/proctor/events` - Log proctoring event (Student, Admin, Super Admin, Teacher)
- `GET /api/proctor/attempts/:id/events` - Get proctor events for attempt
- `GET /api/proctor/exams/:examId/events` - Get all proctor events for exam (Admin, Super Admin, Teacher)
- `GET /api/proctor/exams/:examId/summary` - Get proctoring summary (Admin, Super Admin, Teacher)

### Live Monitoring
- `GET /api/proctor/live-sessions` - Get ongoing exam sessions (Admin, Super Admin, Teacher)
- `GET /api/proctor/suspicious-events` - Get flagged events (Admin, Super Admin, Teacher)
- `GET /api/proctor/dashboard` - Get proctor dashboard (Admin, Super Admin, Teacher)

### Event Management
- `POST /api/proctor/events/:id/flag` - Flag an event (Admin, Super Admin, Teacher)
- `POST /api/proctor/events/:id/resolve` - Resolve flagged event (Admin, Super Admin, Teacher)
- `POST /api/proctor/events/bulk-flag` - Bulk flag events (Admin, Super Admin, Teacher)

### Proctoring Rules
- `GET /api/proctor/rules` - Get proctoring rules (Admin, Super Admin, Teacher)
- `POST /api/proctor/rules` - Create proctoring rule (Admin, Super Admin)
- `PUT /api/proctor/rules/:id` - Update rule (Admin, Super Admin)
- `DELETE /api/proctor/rules/:id` - Delete rule (Admin, Super Admin)

### Utilities
- `GET /api/proctor/event-types` - Get event types
- `GET /api/proctor/students/:userId/proctoring` - Get student proctoring data (Admin, Super Admin, Teacher)
- `GET /api/proctor/exams/:examId/export` - Export proctor report (Admin, Super Admin, Teacher)

---

## Phase 11 – Tagging & Dynamic Assembly APIs

### Dynamic Paper Generation
- `POST /api/exams/:id/generate-paper` - Generate paper from blueprint (Admin, Super Admin, Teacher)
- `GET /api/exams/:id/generated-paper` - Get generated paper
- `POST /api/attempts/:id/generate-questions` - Generate questions for attempt (Student)
- `POST /api/exams/:examId/shuffle` - Shuffle questions (Admin, Super Admin, Teacher)
- `POST /api/exams/:examId/generate-section-wise` - Generate section-wise (Admin, Super Admin, Teacher)

### Taxonomy & Metadata
- `GET /api/taxonomy/view` - Get subject/topic taxonomy
- `GET /api/delivery-types` - Get delivery types

### Blueprint Operations
- `POST /api/blueprints/:id/validate` - Validate blueprint (Admin, Super Admin, Teacher)
- `GET /api/blueprints/:id/preview` - Preview questions (Admin, Super Admin, Teacher)
- `GET /api/blueprints/:id/question-pool` - Get question pool (Admin, Super Admin, Teacher)
- `POST /api/blueprints/:id/optimize` - Optimize blueprint (Admin, Super Admin, Teacher)
- `GET /api/blueprints/:id/validate-pool` - Validate question pool (Admin, Super Admin, Teacher)
- `POST /api/blueprints/:id/analyze` - Analyze question distribution (Admin, Super Admin, Teacher)

### Adaptive & Practice Modes
- `POST /api/attempts/:attemptId/sections/:sectionId/adaptive` - Generate adaptive questions (Student)
- `POST /api/blueprints/:blueprintId/generate-practice` - Generate practice paper (Student, Teacher)

### Question Operations
- `GET /api/questions/:questionId/similar` - Get similar questions
- `POST /api/questions/:questionId/generate-variations` - Generate question variations (Admin, Super Admin, Teacher)

---

## Existing APIs (Previously Implemented)

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/resend-verification` - Resend verification

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password
- `POST /api/users/upload-avatar` - Upload avatar

### Exam Management
- `GET /api/exams` - List exams
- `POST /api/exams` - Create exam (Admin, Super Admin, Teacher)
- `GET /api/exams/:id` - Get exam details
- `PUT /api/exams/:id` - Update exam (Admin, Super Admin, Teacher)
- `DELETE /api/exams/:id` - Delete exam (Admin, Super Admin)

### Exam Scheduling
- `POST /api/exams/:id/schedules` - Create schedule (Admin, Super Admin, Teacher)
- `GET /api/exams/:id/schedules` - List schedules
- `PUT /api/exams/:id/schedules/:scheduleId` - Update schedule (Admin, Super Admin, Teacher)
- `DELETE /api/exams/:id/schedules/:scheduleId` - Delete schedule (Admin, Super Admin)

### Enrollment
- `POST /api/exams/:examId/schedules/:scheduleId/enroll` - Enroll in exam (Student)
- `DELETE /api/exams/:examId/schedules/:scheduleId/enroll` - Cancel enrollment (Student)
- `GET /api/exams/my/enrollments` - Get my enrollments (Student)

---

## Role-Based Access Control

### Roles
- **STUDENT**: Can attempt exams, view results, manage own profile
- **TEACHER**: Can create/update exams, questions, manage students
- **ADMIN**: Full access except super admin operations
- **SUPER_ADMIN**: Complete system access

### Permission Matrix
| Feature | Student | Teacher | Admin | Super Admin |
|---------|---------|---------|-------|-------------|
| View Exams | ✓ | ✓ | ✓ | ✓ |
| Attempt Exams | ✓ | ✗ | ✓ | ✓ |
| Create Exams | ✗ | ✓ | ✓ | ✓ |
| Manage Questions | ✗ | ✓ | ✓ | ✓ |
| View Results | Own | All | All | All |
| Manage Users | Self | ✗ | ✓ | ✓ |
| System Config | ✗ | ✗ | ✓ | ✓ |
| Proctoring | ✗ | ✓ | ✓ | ✓ |

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": {
    "statusCode": 400,
    "message": "Error description",
    "details": "Additional error details"
  }
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Auth endpoints: 5 requests per minute
- General endpoints: 100 requests per minute
- File uploads: 10 requests per minute

---

## File Uploads

- Supported formats: jpeg, jpg, png, gif, mp4, mp3, wav, pdf, doc, docx
- Maximum file size: 10MB per file
- Multiple file upload: Up to 5 files at once

---

## WebSocket Events (For Real-time Features)

Real-time events for:
- Exam timer updates
- Live proctoring alerts
- Notification delivery
- Achievement unlocks

Connect to: `ws://localhost:3000/ws`

---

## API Testing Examples

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@example.com", "password": "password123"}'
```

### Create Question Bank
```bash
curl -X POST http://localhost:3000/api/question-banks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Mathematics Bank", "description": "Math questions"}'
```

### Start Exam Attempt
```bash
curl -X POST http://localhost:3000/api/exams/exam123/attempts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"scheduleId": "schedule123"}'
```

---

## Notes for Frontend Team

1. **Authentication**: Store JWT token securely and include in all API calls
2. **Error Handling**: Implement proper error handling for all API responses
3. **File Uploads**: Use multipart/form-data for file uploads
4. **Real-time**: Implement WebSocket listeners for real-time features
5. **Pagination**: Most list endpoints support pagination (page, limit)
6. **Filtering**: Use query parameters for filtering and search
7. **Role-based**: Hide/show UI elements based on user role

---

## Total APIs Implemented: 89+ endpoints

All major APIs for the exam system have been implemented across all phases as requested.
