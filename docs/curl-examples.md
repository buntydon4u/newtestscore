# Educational Platform API - curl Examples

This document provides curl command examples for testing all API endpoints of the Educational Platform Package Management System.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication. Replace `<JWT_TOKEN>` with your actual JWT token.

---

## Package Management APIs

### 1. Get All Packages
```bash
# Get all packages
curl -X GET "http://localhost:3000/api/packages" \
  -H "Content-Type: application/json"

# Get packages with filters
curl -X GET "http://localhost:3000/api/packages?package_type=subject&class_id=11&is_active=true" \
  -H "Content-Type: application/json"

# Get packages by price range
curl -X GET "http://localhost:3000/api/packages?min_price=1000&max_price=5000" \
  -H "Content-Type: application/json"
```

### 2. Get Package by ID
```bash
curl -X GET "http://localhost:3000/api/packages/1" \
  -H "Content-Type: application/json"
```

### 3. Create New Package
```bash
# Create a subject package
curl -X POST "http://localhost:3000/api/packages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "package_name": "Class 11 Physics",
    "package_type": "subject",
    "description": "Complete Physics course for Class 11",
    "price": 1999,
    "duration_months": 12,
    "class_id": 1,
    "stream_id": 2,
    "subject_id": 1
  }'

# Create a stream package
curl -X POST "http://localhost:3000/api/packages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "package_name": "Class 12 Medical Stream",
    "package_type": "stream",
    "description": "Complete Medical stream package for Class 12",
    "price": 7999,
    "duration_months": 12,
    "class_id": 2,
    "stream_id": 1
  }'

# Create a test series package
curl -X POST "http://localhost:3000/api/packages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "package_name": "JEE Test Series",
    "package_type": "test_series",
    "description": "Complete JEE preparation test series",
    "price": 4999,
    "duration_months": 12
  }'
```

### 4. Update Package
```bash
curl -X PUT "http://localhost:3000/api/packages/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "price": 2499,
    "description": "Updated Physics course with additional content",
    "is_active": true
  }'
```

### 5. Delete Package (Soft Delete)
```bash
curl -X DELETE "http://localhost:3000/api/packages/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 6. Get Classes
```bash
curl -X GET "http://localhost:3000/api/packages/classes/list" \
  -H "Content-Type: application/json"
```

### 7. Get Streams
```bash
curl -X GET "http://localhost:3000/api/packages/streams/list" \
  -H "Content-Type: application/json"
```

### 8. Get Subjects
```bash
# Get all subjects
curl -X GET "http://localhost:3000/api/packages/subjects/list" \
  -H "Content-Type: application/json"

# Get subjects by stream
curl -X GET "http://localhost:3000/api/packages/subjects/list?stream_id=2" \
  -H "Content-Type: application/json"
```

---

## Order Management APIs

### 1. Create Order
```bash
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "package_ids": [1, 2, 3]
  }'

# Create order with single package
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "package_ids": [1]
  }'
```

### 2. Get Order by ID
```bash
curl -X GET "http://localhost:3000/api/orders/123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 3. Get Student Orders
```bash
# Get all orders for a student
curl -X GET "http://localhost:3000/api/orders/student/456" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Get paginated orders
curl -X GET "http://localhost:3000/api/orders/student/456?limit=5&offset=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 4. Update Payment Status
```bash
# Mark order as paid
curl -X PUT "http://localhost:3000/api/orders/123/payment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "status": "paid"
  }'

# Mark order as failed
curl -X PUT "http://localhost:3000/api/orders/123/payment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "status": "failed"
  }'

# Refund order
curl -X PUT "http://localhost:3000/api/orders/123/payment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "status": "refunded"
  }'
```

### 5. Payment Webhook
```bash
# Simulate payment gateway webhook
curl -X POST "http://localhost:3000/api/orders/webhook/payment" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 123,
    "payment_status": "paid",
    "transaction_id": "txn_1234567890",
    "payment_gateway": "razorpay"
  }'

# Failed payment webhook
curl -X POST "http://localhost:3000/api/orders/webhook/payment" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 124,
    "payment_status": "failed",
    "transaction_id": "txn_failed_123",
    "payment_gateway": "stripe"
  }'
```

---

## Student Access APIs

### 1. Get Student Packages
```bash
curl -X GET "http://localhost:3000/api/packages/student/456/packages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 2. Check Student Access
```bash
curl -X GET "http://localhost:3000/api/packages/student/456/access/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## Admin APIs

### 1. Get Order Statistics
```bash
# Get all time statistics
curl -X GET "http://localhost:3000/api/orders/stats/admin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"

# Get statistics for date range
curl -X GET "http://localhost:3000/api/orders/stats/admin?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

---

## Testing Workflow Examples

### Complete Purchase Flow
```bash
# 1. Login to get JWT token (replace with actual auth endpoint)
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'

# 2. Browse available packages
curl -X GET "http://localhost:3000/api/packages?package_type=subject&class_id=11"

# 3. Create order
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN_FROM_LOGIN>" \
  -d '{
    "package_ids": [1, 2, 3]
  }'

# 4. Simulate payment success
curl -X POST "http://localhost:3000/api/orders/webhook/payment" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": <ORDER_ID_FROM_STEP_3>,
    "payment_status": "paid",
    "transaction_id": "txn_test_123",
    "payment_gateway": "test"
  }'

# 5. Verify access
curl -X GET "http://localhost:3000/api/packages/student/456/packages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN_FROM_LOGIN>"
```

### Package Management Workflow
```bash
# 1. Get existing classes, streams, subjects
curl -X GET "http://localhost:3000/api/packages/classes/list"
curl -X GET "http://localhost:3000/api/packages/streams/list"
curl -X GET "http://localhost:3000/api/packages/subjects/list?stream_id=2"

# 2. Create new package
curl -X POST "http://localhost:3000/api/packages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -d '{
    "package_name": "Class 10 Mathematics",
    "package_type": "subject",
    "description": "Mathematics for Class 10",
    "price": 1499,
    "duration_months": 12,
    "class_id": 3,
    "stream_id": 5,
    "subject_id": 3
  }'

# 3. Update package
curl -X PUT "http://localhost:3000/api/packages/<NEW_PACKAGE_ID>" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -d '{
    "price": 1799,
    "description": "Updated Mathematics course with video lectures"
  }'

# 4. Verify package in listings
curl -X GET "http://localhost:3000/api/packages?class_id=10&subject_id=3"
```

---

## Error Handling Examples

### Invalid Package Creation
```bash
# Missing required fields
curl -X POST "http://localhost:3000/api/packages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "package_name": "Test Package"
  }'
# Expected: 400 Bad Request - Missing required fields

# Invalid package type
curl -X POST "http://localhost:3000/api/packages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "package_name": "Test Package",
    "package_type": "invalid_type",
    "price": 1000,
    "duration_months": 12
  }'
# Expected: 400 Bad Request - Invalid package_type
```

### Authentication Errors
```bash
# Missing authorization
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "package_ids": [1, 2, 3]
  }'
# Expected: 401 Unauthorized

# Invalid token
curl -X GET "http://localhost:3000/api/orders/123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token"
# Expected: 401 Unauthorized
```

---

## Tips for Testing

1. **Save responses to files:**
   ```bash
   curl -X GET "http://localhost:3000/api/packages" > packages.json
   ```

2. **Pretty print JSON responses:**
   ```bash
   curl -X GET "http://localhost:3000/api/packages" | python -m json.tool
   ```

3. **Include verbose output for debugging:**
   ```bash
   curl -v -X GET "http://localhost:3000/api/packages"
   ```

4. **Save and reuse JWT token:**
   ```bash
   # Save token to variable
   TOKEN=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password"}' \
     | python -c "import sys, json; print(json.load(sys.stdin)['token'])")
   
   # Use token in subsequent requests
   curl -X GET "http://localhost:3000/api/orders" \
     -H "Authorization: Bearer $TOKEN"
   ```

5. **Test with different content types:**
   ```bash
   # Test with form data
   curl -X POST "http://localhost:3000/api/orders" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "package_ids=1&package_ids=2&package_ids=3"
   ```

---

## Common Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

Remember to replace:
- `<JWT_TOKEN>` with actual authentication token
- `<ADMIN_JWT_TOKEN>` with admin token
- `<ORDER_ID>` with actual order ID
- `<PACKAGE_ID>` with actual package ID
- `localhost:3000` with your actual server URL
