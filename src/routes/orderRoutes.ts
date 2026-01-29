import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = Router();
const orderController = new OrderController();

// Order CRUD routes - require authentication
router.post('/', authMiddleware, orderController.createOrder);
router.get('/:id', authMiddleware, orderController.getOrderById);
router.get('/student/:studentId', authMiddleware, orderController.getStudentOrders);

// Payment routes - require authentication (except webhook)
router.put('/:id/payment', authMiddleware, orderController.updatePaymentStatus);
router.post('/webhook/payment', orderController.paymentWebhook); // Webhook doesn't need auth

// Admin routes - require SUPER_ADMIN role
router.get('/stats/admin', authMiddleware, roleMiddleware('SUPER_ADMIN'), orderController.getOrderStats);

export default router;
