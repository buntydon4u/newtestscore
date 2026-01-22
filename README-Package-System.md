# Educational Platform - Package Management System

## Overview

This is a comprehensive package management system for an educational platform. It supports class-based, stream-based, and subject-based packages with flexible pricing, duration, and access control.

## Features

- ✅ Package Management (CRUD operations)
- ✅ Order Processing & Payment Integration
- ✅ Student Access Control
- ✅ Flexible Package Types (Class, Stream, Subject, Test Series, Chapter)
- ✅ PostgreSQL Database with Optimized Schema
- ✅ RESTful APIs with TypeScript
- ✅ Comprehensive Documentation

## Tech Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL
- **Authentication:** JWT (integrated with existing system)
- **Validation:** Joi
- **Security:** Helmet, CORS, Rate Limiting

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd newtestscore
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update your `.env` file with:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=educational_platform
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

4. **Database Setup**
   
   Create a PostgreSQL database:
   ```sql
   CREATE DATABASE educational_platform;
   ```
   
   Run the schema and seed data:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

## Running the Application

1. **Development Mode**
   ```bash
   npm run dev
   ```
   
   The server will start at `http://localhost:3000`

2. **Production Mode**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Package Management
- `GET /api/packages` - Get all packages with filters
- `GET /api/packages/:id` - Get package by ID
- `POST /api/packages` - Create new package
- `PUT /api/packages/:id` - Update package
- `DELETE /api/packages/:id` - Delete package (soft delete)
- `GET /api/packages/classes/list` - Get all classes
- `GET /api/packages/streams/list` - Get all streams
- `GET /api/packages/subjects/list` - Get all subjects

### Order Management
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/student/:studentId` - Get student's orders
- `PUT /api/orders/:id/payment` - Update payment status
- `POST /api/orders/webhook/payment` - Payment webhook

### Student Access
- `GET /api/packages/student/:studentId/packages` - Get student's accessible packages
- `GET /api/packages/student/:studentId/access/:packageId` - Check package access

### Admin
- `GET /api/orders/stats/admin` - Get order statistics

## Database Schema

### Core Tables

1. **classes** - Educational classes (9, 10, 11, 12)
2. **streams** - Academic streams (Medical, Non-Medical, Commerce, Arts)
3. **subjects** - Individual subjects
4. **stream_subjects** - Many-to-many relationship
5. **packages** - Sellable products
6. **package_mappings** - Links packages to content
7. **orders** - Purchase orders
8. **order_items** - Items in an order
9. **student_access** - Access control
10. **students** - Student information

## Package Types

### 1. Class Package
- Access to all content for a specific class
- Example: "Class 11 Complete Package"

### 2. Stream Package
- Access to all subjects in a stream for a class
- Example: "Class 12 Medical Stream"

### 3. Subject Package
- Access to a specific subject
- Example: "Class 11 Physics"

### 4. Test Series
- Access to test series only
- Example: "JEE Test Series"

### 5. Chapter Package
- Access to specific chapters (future feature)

## Payment Integration

The system is designed to integrate with any payment gateway:

1. **Create Order**: Student selects packages and creates an order
2. **Payment Processing**: Redirect to payment gateway
3. **Webhook Handling**: Gateway notifies about payment status
4. **Access Granting**: System grants access on successful payment

### Supported Payment Statuses
- `pending` - Order created, awaiting payment
- `paid` - Payment successful, access granted
- `failed` - Payment failed
- `refunded` - Payment refunded, access revoked

## Sample Data

The system comes with pre-seeded data:
- Classes: 9, 10, 11, 12
- Streams: Medical, Non-Medical, Commerce, Arts, General
- Subjects: Physics, Chemistry, Mathematics, Biology, English, Hindi, etc.
- Sample packages for various combinations
- Test students for testing

## Testing

### API Testing Examples

1. **Get all packages:**
   ```bash
   curl http://localhost:3000/api/packages
   ```

2. **Create a package:**
   ```bash
   curl -X POST http://localhost:3000/api/packages \
     -H "Content-Type: application/json" \
     -d '{
       "package_name": "Class 11 Physics",
       "package_type": "subject",
       "price": 1999,
       "duration_months": 12,
       "class_id": 1,
       "stream_id": 2,
       "subject_id": 1
     }'
   ```

3. **Create an order:**
   ```bash
   curl -X POST http://localhost:3000/api/orders \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <jwt-token>" \
     -d '{
       "package_ids": [1, 2, 3]
     }'
   ```

## UI Implementation Guide

See the [API Documentation](./docs/API-Documentation.md) for detailed implementation instructions for the UI team.

## Project Structure

```
src/
├── config/
│   ├── database.ts      # Prisma database config
│   └── packageDb.ts     # PostgreSQL config for packages
├── controllers/
│   ├── packageController.ts
│   └── orderController.ts
├── services/
│   ├── packageService.ts
│   └── orderService.ts
├── routes/
│   ├── packageRoutes.ts
│   └── orderRoutes.ts
├── types/
│   └── packageTypes.ts
└── index.ts             # Main application file

database/
├── schema.sql           # Database schema
└── seed.sql             # Sample data

docs/
└── API-Documentation.md # Detailed API documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For any queries or issues, please contact the development team.
