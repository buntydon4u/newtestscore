import { Router } from 'express';
import { AchievementController } from '../controllers/achievement.controller.js';
import { roleMiddleware, authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const controller = new AchievementController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Achievement CRUD
router.get('/users/:userId/achievements', asyncHandler(controller.list.bind(controller)));
router.post('/', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.create.bind(controller)));
router.get('/users/:userId/achievements/unlocked', asyncHandler(controller.getUnlocked.bind(controller)));
router.get('/users/:userId/achievements/pending', asyncHandler(controller.getPending.bind(controller)));
router.get('/achievements/:id', asyncHandler(controller.getAchievementById.bind(controller)));

// Achievement utilities
router.get('/achievements/leaderboard', asyncHandler(controller.getLeaderboard.bind(controller)));
router.get('/achievements/categories', asyncHandler(controller.getCategories.bind(controller)));
router.get('/users/:userId/achievements/stats', asyncHandler(controller.getStats.bind(controller)));
router.get('/users/:userId/achievements/recent', asyncHandler(controller.getRecentAchievements.bind(controller)));
router.get('/users/:userId/achievements/progress', asyncHandler(controller.getProgress.bind(controller)));

// Achievement triggers
router.post('/users/:userId/achievements/check', asyncHandler(controller.checkAchievements.bind(controller)));

// Social features
router.post('/achievements/:id/share', asyncHandler(controller.shareAchievement.bind(controller)));

// Milestones
router.post('/milestones', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.createMilestone.bind(controller)));
router.get('/users/:userId/milestones', asyncHandler(controller.getMilestones.bind(controller)));

export default router;
