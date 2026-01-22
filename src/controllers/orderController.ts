import { Request, Response } from 'express';
import { OrderService } from '../services/orderService.js';
import { CreateOrderRequest } from '../types/packageTypes.js';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  // Create new order
  createOrder = async (req: Request, res: Response) => {
    try {
      // Assume student_id comes from authentication middleware
      const studentId = (req as any).user?.studentId || req.body.student_id;
      
      if (!studentId) {
        return res.status(401).json({
          success: false,
          message: 'Student authentication required'
        });
      }

      const orderData: CreateOrderRequest = req.body;

      // Validate request
      if (!orderData.package_ids || !Array.isArray(orderData.package_ids) || orderData.package_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'package_ids must be a non-empty array'
        });
      }

      const newOrder = await this.orderService.createOrder(studentId, orderData);
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: newOrder
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get order by ID
  getOrderById = async (req: Request, res: Response) => {
    try {
      const orderId = req.params.id;
      const studentId = (req as any).user?.id; // From JWT token
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order ID'
        });
      }

      const order = await this.orderService.getOrderById(orderId, studentId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get student's orders
  getStudentOrders = async (req: Request, res: Response) => {
    try {
      const studentId = req.params.studentId;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      const orders = await this.orderService.getStudentOrders(studentId, limit, offset);
      
      res.json({
        success: true,
        data: orders,
        count: orders.length,
        limit,
        offset
      });
    } catch (error) {
      console.error('Error fetching student orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch student orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Update payment status (webhook endpoint)
  updatePaymentStatus = async (req: Request, res: Response) => {
    try {
      const orderId = req.params.id;
      const { status } = req.body;
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order ID'
        });
      }

      if (!status || !['pending', 'paid', 'failed', 'refunded'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status'
        });
      }

      const updatedOrder = await this.orderService.updatePaymentStatus(orderId, status);
      
      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // If this is a webhook, acknowledge receipt
      if (req.path.includes('webhook')) {
        res.status(200).send('OK');
      } else {
        res.json({
          success: true,
          message: 'Payment status updated successfully',
          data: updatedOrder
        });
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update payment status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get order statistics (admin endpoint)
  getOrderStats = async (req: Request, res: Response) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const stats = await this.orderService.getOrderStats(startDate, endDate);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching order stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Payment webhook handler for payment gateways
  paymentWebhook = async (req: Request, res: Response) => {
    try {
      // This is a generic webhook handler
      // You'll need to implement specific logic for each payment gateway
      const { order_id, payment_status, transaction_id, payment_gateway } = req.body;
      
      console.log('Payment webhook received:', {
        order_id,
        payment_status,
        transaction_id,
        payment_gateway
      });

      if (!order_id || !payment_status) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: order_id, payment_status'
        });
      }

      // Update payment status
      await this.orderService.updatePaymentStatus(order_id, payment_status);
      
      // TODO: Send confirmation email/SMS to student
      // TODO: Update analytics
      // TODO: Notify admin if payment failed
      
      res.status(200).send('Webhook received successfully');
    } catch (error) {
      console.error('Error processing payment webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process webhook',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
