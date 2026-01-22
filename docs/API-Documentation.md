# Educational Platform API Documentation

## Overview

This API provides endpoints for managing educational packages, orders, and student access in the educational platform. The system supports class-based, stream-based, and subject-based packages with flexible pricing and duration.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Package Management APIs

### 1. Get All Packages

**Endpoint:** `GET /packages`

**Query Parameters:**
- `package_type` (optional): Filter by package type (`class`, `subject`, `stream`, `test_series`, `chapter`)
- `class_id` (optional): Filter by class ID
- `stream_id` (optional): Filter by stream ID
- `subject_id` (optional): Filter by subject ID
- `is_active` (optional): Filter by active status (`true`/`false`)
- `min_price` (optional): Minimum price filter
- `max_price` (optional): Maximum price filter

**Example Request:**
```bash
GET /api/packages?package_type=subject&class_id=11&is_active=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "package_id": 1,
      "package_name": "Class 11 Physics",
      "package_type": "subject",
      "description": "Physics for Class 11",
      "price": "1999.00",
      "duration_months": 12,
      "is_active": true,
      "created_at": "2024-01-18T10:00:00Z",
      "updated_at": "2024-01-18T10:00:00Z",
      "class_name": "11",
      "stream_name": "Non-Medical",
      "subject_name": "Physics"
    }
  ],
  "count": 1
}
```

### 2. Get Package by ID

**Endpoint:** `GET /packages/:id`

**Example Request:**
```bash
GET /api/packages/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "package_id": 1,
    "package_name": "Class 11 Physics",
    "package_type": "subject",
    "description": "Physics for Class 11",
    "price": "1999.00",
    "duration_months": 12,
    "is_active": true,
    "class_name": "11",
    "stream_name": "Non-Medical",
    "subject_name": "Physics"
  }
}
```

### 3. Create New Package

**Endpoint:** `POST /packages`

**Request Body:**
```json
{
  "package_name": "Class 11 Chemistry",
  "package_type": "subject",
  "description": "Complete Chemistry course for Class 11",
  "price": 1999,
  "duration_months": 12,
  "class_id": 1,
  "stream_id": 2,
  "subject_id": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Package created successfully",
  "data": {
    "package_id": 2,
    "package_name": "Class 11 Chemistry",
    "package_type": "subject",
    "description": "Complete Chemistry course for Class 11",
    "price": "1999.00",
    "duration_months": 12,
    "is_active": true,
    "created_at": "2024-01-18T10:30:00Z",
    "updated_at": "2024-01-18T10:30:00Z"
  }
}
```

### 4. Update Package

**Endpoint:** `PUT /packages/:id`

**Request Body:**
```json
{
  "price": 2499,
  "description": "Updated Chemistry course with additional content",
  "is_active": true
}
```

### 5. Delete Package (Soft Delete)

**Endpoint:** `DELETE /packages/:id`

**Response:**
```json
{
  "success": true,
  "message": "Package deleted successfully"
}
```

### 6. Get Classes

**Endpoint:** `GET /packages/classes/list`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "class_id": 1,
      "class_name": "11",
      "description": "Class 11 - Senior Secondary",
      "created_at": "2024-01-18T09:00:00Z"
    },
    {
      "class_id": 2,
      "class_name": "12",
      "description": "Class 12 - Senior Secondary",
      "created_at": "2024-01-18T09:00:00Z"
    }
  ]
}
```

### 7. Get Streams

**Endpoint:** `GET /packages/streams/list`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "stream_id": 1,
      "stream_name": "Medical",
      "description": "Medical Stream - Physics, Chemistry, Biology",
      "created_at": "2024-01-18T09:00:00Z"
    },
    {
      "stream_id": 2,
      "stream_name": "Non-Medical",
      "description": "Non-Medical Stream - Physics, Chemistry, Mathematics",
      "created_at": "2024-01-18T09:00:00Z"
    }
  ]
}
```

### 8. Get Subjects

**Endpoint:** `GET /packages/subjects/list`

**Query Parameters:**
- `stream_id` (optional): Filter subjects by stream ID

**Example Request:**
```bash
GET /api/packages/subjects/list?stream_id=2
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "subject_id": 1,
      "subject_name": "Physics",
      "description": "Physics - Study of matter and energy",
      "created_at": "2024-01-18T09:00:00Z"
    },
    {
      "subject_id": 2,
      "subject_name": "Chemistry",
      "description": "Chemistry - Study of substances and their properties",
      "created_at": "2024-01-18T09:00:00Z"
    },
    {
      "subject_id": 3,
      "subject_name": "Mathematics",
      "description": "Mathematics - Study of numbers and shapes",
      "created_at": "2024-01-18T09:00:00Z"
    }
  ]
}
```

## Order Management APIs

### 1. Create Order

**Endpoint:** `POST /orders`

**Request Body:**
```json
{
  "package_ids": [1, 2, 3]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order_id": 123,
    "student_id": 456,
    "total_amount": "5997.00",
    "payment_status": "pending",
    "items": [
      {
        "package_id": 1,
        "package_name": "Class 11 Physics",
        "price": "1999.00"
      },
      {
        "package_id": 2,
        "package_name": "Class 11 Chemistry",
        "price": "1999.00"
      },
      {
        "package_id": 3,
        "package_name": "Class 11 Mathematics",
        "price": "1999.00"
      }
    ]
  }
}
```

### 2. Get Order by ID

**Endpoint:** `GET /orders/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": 123,
    "student_id": 456,
    "total_amount": "5997.00",
    "payment_status": "paid",
    "items": [
      {
        "package_id": 1,
        "package_name": "Class 11 Physics",
        "price": "1999.00"
      }
    ]
  }
}
```

### 3. Get Student Orders

**Endpoint:** `GET /orders/student/:studentId`

**Query Parameters:**
- `limit` (optional): Number of orders to return (default: 10)
- `offset` (optional): Number of orders to skip (default: 0)

**Example Request:**
```bash
GET /api/orders/student/456?limit=5&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "order_id": 123,
      "student_id": 456,
      "total_amount": "5997.00",
      "payment_status": "paid",
      "items": [
        {
          "package_id": 1,
          "package_name": "Class 11 Physics",
          "price": "1999.00"
        }
      ]
    }
  ],
  "count": 1,
  "limit": 5,
  "offset": 0
}
```

### 4. Update Payment Status

**Endpoint:** `PUT /orders/:id/payment`

**Request Body:**
```json
{
  "status": "paid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment status updated successfully",
  "data": {
    "order_id": 123,
    "student_id": 456,
    "total_amount": "5997.00",
    "payment_status": "paid",
    "created_at": "2024-01-18T11:00:00Z",
    "updated_at": "2024-01-18T11:30:00Z"
  }
}
```

### 5. Payment Webhook

**Endpoint:** `POST /orders/webhook/payment`

**Request Body:**
```json
{
  "order_id": 123,
  "payment_status": "paid",
  "transaction_id": "txn_1234567890",
  "payment_gateway": "razorpay"
}
```

**Response:** `200 OK`

## Student Access APIs

### 1. Get Student Packages

**Endpoint:** `GET /packages/student/:studentId/packages`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "access_id": 1,
      "student_id": 456,
      "package_id": 1,
      "expires_at": "2025-01-18T11:30:00Z",
      "activated_at": "2024-01-18T11:30:00Z",
      "package_name": "Class 11 Physics",
      "package_type": "subject",
      "description": "Physics for Class 11",
      "class_name": "11",
      "stream_name": "Non-Medical",
      "subject_name": "Physics"
    }
  ],
  "count": 1
}
```

### 2. Check Student Access

**Endpoint:** `GET /packages/student/:studentId/access/:packageId`

**Response:**
```json
{
  "success": true,
  "data": {
    "hasAccess": true,
    "studentId": 456,
    "packageId": 1
  }
}
```

## Admin APIs

### 1. Get Order Statistics

**Endpoint:** `GET /orders/stats/admin`

**Query Parameters:**
- `startDate` (optional): Filter from date (ISO string)
- `endDate` (optional): Filter to date (ISO string)

**Example Request:**
```bash
GET /api/orders/stats/admin?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_orders": "150",
    "paid_orders": "120",
    "pending_orders": "20",
    "failed_orders": "8",
    "refunded_orders": "2",
    "total_revenue": "299880.00"
  }
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Package Types and Requirements

### Class Package
- `package_type`: `"class"`
- Required: `class_id`
- Optional: `description`

### Stream Package
- `package_type`: `"stream"`
- Required: `class_id`, `stream_id`
- Optional: `description`

### Subject Package
- `package_type`: `"subject"`
- Required: `class_id`, `stream_id`, `subject_id`
- Optional: `description`

### Test Series Package
- `package_type`: `"test_series"`
- Required: None
- Optional: `description`

### Chapter Package
- `package_type`: `"chapter"`
- Required: `class_id`, `stream_id`, `subject_id`, `chapter_id`
- Optional: `description`

## Payment Flow

1. Student selects packages and creates order
2. Order is created with `payment_status: "pending"`
3. Payment is processed through payment gateway
4. Payment gateway sends webhook to `/orders/webhook/payment`
5. System updates payment status and grants access if successful
6. Student can access packages through student access endpoints

## Database Schema

The system uses PostgreSQL with the following main tables:
- `classes`: Educational classes (9, 10, 11, 12)
- `streams`: Academic streams (Medical, Non-Medical, Commerce, Arts)
- `subjects`: Individual subjects
- `stream_subjects`: Many-to-many relationship between streams and subjects
- `packages`: Sellable products with pricing and duration
- `package_mappings`: Links packages to educational content
- `orders`: Purchase orders
- `order_items`: Individual packages in an order
- `student_access`: Tracks what students can access

## Sample Data

The database comes pre-seeded with:
- Classes: 9, 10, 11, 12
- Streams: Medical, Non-Medical, Commerce, Arts, General
- Subjects: Physics, Chemistry, Mathematics, Biology, English, etc.
- Sample packages for different combinations
- Sample students for testing

## Implementation Notes for UI Team

1. **Package Selection Flow:**
   - First, fetch classes using `/packages/classes/list`
   - Then fetch streams using `/packages/streams/list`
   - Based on selected stream, fetch subjects using `/packages/subjects/list?stream_id={id}`
   - Finally, fetch packages using `/packages` with appropriate filters

2. **Purchase Flow:**
   - Collect selected package IDs
   - Create order using `/orders`
   - Redirect to payment gateway with order_id
   - After payment, check order status using `/orders/{id}`
   - Access purchased content using `/packages/student/{studentId}/packages`

3. **Access Control:**
   - Before showing any content, check access using `/packages/student/{studentId}/access/{packageId}`
   - Show expiry date from student packages endpoint
   - Handle expired packages gracefully

4. **Error Handling:**
   - Always check the `success` field in responses
   - Display user-friendly error messages from the `message` field
   - Log detailed errors for debugging

5. **Pagination:**
   - Use `limit` and `offset` parameters for paginated endpoints
   - Display total count to user
   - Implement infinite scroll or pagination controls

6. **Real-time Updates:**
   - For payment status updates, consider implementing polling or websockets
   - Update UI when payment status changes from pending to paid/failed

7. **Caching:**
   - Cache class, stream, and subject data as they don't change frequently
   - Cache package data but refresh when user navigates to catalog
   - Don't cache order or access data as it changes frequently
