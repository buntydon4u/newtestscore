import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';

const router = Router();
const orderController = new OrderController();

// Order CRUD routes
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderById);
router.get('/student/:studentId', orderController.getStudentOrders);

// Payment routes
router.put('/:id/payment', orderController.updatePaymentStatus);
router.post('/webhook/payment', orderController.paymentWebhook);

// Admin routes
router.get('/stats/admin', orderController.getOrderStats);

export default router;
