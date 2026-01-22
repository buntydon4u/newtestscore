import { Pool } from 'pg';
import packageDb from '../config/packageDb.js';
import {
  Order,
  OrderItem,
  CreateOrderRequest,
  OrderResponse,
  StudentAccess,
  Package
} from '../types/packageTypes.js';

export class OrderService {
  private db: Pool;

  constructor() {
    this.db = packageDb;
  }

  // Create new order
  async createOrder(studentId: string, orderData: CreateOrderRequest): Promise<OrderResponse> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Generate unique order ID
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Get package details and calculate total
      const packageQuery = `
        SELECT id, name, price 
        FROM "packages" 
        WHERE id = ANY($1) AND "isActive" = true
      `;
      const packageResult = await client.query(packageQuery, [orderData.package_ids]);
      
      if (packageResult.rows.length !== orderData.package_ids.length) {
        throw new Error('One or more packages are not available');
      }

      const totalAmount = packageResult.rows.reduce((sum: number, pkg: any) => sum + parseFloat(pkg.price), 0);

      // Create order
      const orderQuery = `
        INSERT INTO "orders" (id, "studentId", "totalAmount", "paymentStatus", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, 'pending', NOW(), NOW())
        RETURNING *
      `;
      const orderValues = [orderId, studentId, totalAmount];
      const orderResult = await client.query(orderQuery, orderValues);
      const newOrder = orderResult.rows[0];

      // Create order items
      const items: any[] = [];
      for (const pkg of packageResult.rows) {
        const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const itemQuery = `
          INSERT INTO "order_items" (id, "orderId", "packageId", price, "createdAt")
          VALUES ($1, $2, $3, $4, NOW())
          RETURNING *
        `;
        await client.query(itemQuery, [itemId, orderId, pkg.id, pkg.price]);
        items.push({
          package_id: pkg.id,
          package_name: pkg.name,
          price: pkg.price
        });
      }

      await client.query('COMMIT');

      return {
        order_id: newOrder.id,
        student_id: newOrder.studentId,
        total_amount: newOrder.totalAmount,
        payment_status: newOrder.paymentStatus,
        items
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get order by ID
  async getOrderById(orderId: string, studentId?: string): Promise<OrderResponse | null> {
    let query = `
      SELECT 
        o.id as order_id,
        o."studentId" as student_id,
        o."totalAmount" as total_amount,
        o."paymentStatus" as payment_status,
        o."createdAt" as created_at,
        oi."packageId" as package_id,
        p.name as package_name,
        oi.price
      FROM "orders" o
      JOIN "order_items" oi ON o.id = oi."orderId"
      JOIN "packages" p ON oi."packageId" = p.id
      WHERE o.id = $1
    `;

    const params: any[] = [orderId];

    if (studentId) {
      query += ` AND o."studentId" = $2`;
      params.push(studentId);
    }

    const result = await this.db.query(query, params);

    if (result.rows.length === 0) {
      return null;
    }

    const order = result.rows[0];
    const items = result.rows.map((row: { package_id: string; package_name: string; price: number }) => ({
      package_id: row.package_id,
      package_name: row.package_name,
      price: row.price
    }));

    return {
      order_id: order.order_id,
      student_id: order.student_id,
      total_amount: order.total_amount,
      payment_status: order.payment_status,
      items
    };
  }

  // Get student's orders
  async getStudentOrders(studentId: string, limit: number = 10, offset: number = 0): Promise<OrderResponse[]> {
    const query = `
      SELECT 
        o.id as order_id,
        o."studentId" as student_id,
        o."totalAmount" as total_amount,
        o."paymentStatus" as payment_status,
        o."createdAt" as created_at,
        oi."packageId" as package_id,
        p.name as package_name,
        oi.price
      FROM "orders" o
      JOIN "order_items" oi ON o.id = oi."orderId"
      JOIN "packages" p ON oi."packageId" = p.id
      WHERE o."studentId" = $1
      ORDER BY o."createdAt" DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await this.db.query(query, [studentId, limit, offset]);

    // Group by order_id
    const ordersMap = new Map();
    result.rows.forEach((row: any) => {
      if (!ordersMap.has(row.order_id)) {
        ordersMap.set(row.order_id, {
          order_id: row.order_id,
          student_id: row.student_id,
          total_amount: row.total_amount,
          payment_status: row.payment_status,
          items: []
        });
      }
      ordersMap.get(row.order_id).items.push({
        package_id: row.package_id,
        package_name: row.package_name,
        price: row.price
      });
    });

    return Array.from(ordersMap.values());
  }

  // Update payment status
  async updatePaymentStatus(orderId: string, status: string): Promise<boolean> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Update order status
      const updateQuery = `
        UPDATE "orders" 
        SET "paymentStatus" = $1, "updatedAt" = NOW()
        WHERE id = $2
        RETURNING *
      `;
      const result = await client.query(updateQuery, [status, orderId]);

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      const order = result.rows[0];

      // If payment is successful, grant student access
      if (status === 'paid') {
        // Get package IDs from order
        const packageQuery = `
          SELECT "packageId" FROM "order_items" WHERE "orderId" = $1
        `;
        const packageResult = await client.query(packageQuery, [orderId]);

        for (const pkg of packageResult.rows) {
          // Check if access already exists
          const accessCheckQuery = `
            SELECT id FROM "student_access" 
            WHERE "studentId" = $1 AND "packageId" = $2
          `;
          const existingAccess = await client.query(accessCheckQuery, [order.studentId, pkg.packageId]);

          if (existingAccess.rows.length === 0) {
            // Grant access for 12 months from now
            const accessId = `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const accessQuery = `
              INSERT INTO "student_access" (id, "studentId", "packageId", "expiresAt", "activatedAt", "createdAt", "updatedAt")
              VALUES ($1, $2, $3, NOW() + INTERVAL '12 months', NOW(), NOW(), NOW())
            `;
            await client.query(accessQuery, [accessId, order.studentId, pkg.packageId]);
          }
        }
      }

      // If payment is refunded, revoke access
      if (status === 'refunded') {
        const revokeQuery = `
          DELETE FROM "student_access" 
          WHERE "studentId" = $1 AND "packageId" IN (
            SELECT "packageId" FROM "order_items" WHERE "orderId" = $2
          )
        `;
        await client.query(revokeQuery, [order.studentId, orderId]);
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get order statistics (admin)
  async getOrderStats(startDate?: Date, endDate?: Date): Promise<any> {
    let query = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN "paymentStatus" = 'paid' THEN 1 END) as paid_orders,
        COUNT(CASE WHEN "paymentStatus" = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN "paymentStatus" = 'failed' THEN 1 END) as failed_orders,
        COUNT(CASE WHEN "paymentStatus" = 'refunded' THEN 1 END) as refunded_orders,
        SUM("totalAmount") as total_revenue,
        SUM(CASE WHEN "paymentStatus" = 'paid' THEN "totalAmount" ELSE 0 END) as paid_revenue
      FROM "orders"
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (startDate) {
      query += ` AND "createdAt" >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND "createdAt" <= $${paramIndex++}`;
      params.push(endDate);
    }

    const result = await this.db.query(query, params);
    return result.rows[0];
  }
}
