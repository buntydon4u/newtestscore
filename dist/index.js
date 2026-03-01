import dotenv from 'dotenv';
// Load environment variables FIRST before any other imports
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectPostgres } from './config/database.js';
import { connectMongoDB } from './config/mongodb.js';
import { auditMiddleware } from './middleware/audit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
// Import packageDb to ensure it loads at startup
import packageDb from './config/packageDb.js';
console.log('Package DB imported:', !!packageDb);
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import superAdminRoutes from './routes/super-admin.routes.js';
import configRoutes from './routes/config.routes.js';
import auditRoutes from './routes/audit.routes.js';
import courseRoutes from './routes/course.routes.js';
import studentRoutes from './routes/student.routes.js';
import examRoutes from './routes/exam.routes.js';
import packageRoutes from './routes/packageRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import questionBankRoutes from './routes/questionBank.routes.js';
import questionRoutes from './routes/question.routes.js';
import tagRoutes from './routes/tag.routes.js';
import passageRoutes from './routes/passage.routes.js';
import mediaRoutes from './routes/media.routes.js';
import examSectionRoutes from './routes/examSection.routes.js';
import blueprintRoutes from './routes/blueprint.routes.js';
import examAttemptRoutes from './routes/examAttempt.routes.js';
import scoringRoutes from './routes/scoring.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import progressReportRoutes from './routes/progressReport.routes.js';
import achievementRoutes from './routes/achievement.routes.js';
import proctorRoutes from './routes/proctor.routes.js';
import dynamicAssemblyRoutes from './routes/dynamicAssembly.routes.js';
dotenv.config();
// Debug DATABASE_URL after dotenv is loaded
console.log('=== DATABASE_URL Debug ===');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
console.log('========================');
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
app.use(helmet());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        // Allowed origins
        const allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// app.use(rateLimit);
app.use(auditMiddleware);
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date(),
    });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/config', configRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/question-banks', questionBankRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/passages', passageRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/exams', examSectionRoutes);
app.use('/api/blueprints', blueprintRoutes);
app.use('/api', examAttemptRoutes);
app.use('/api', scoringRoutes);
app.use('/api/scoring', scoringRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', progressReportRoutes);
app.use('/api', achievementRoutes);
app.use('/api/proctor', proctorRoutes);
app.use('/api', dynamicAssemblyRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
async function startServer() {
    try {
        await connectPostgres();
        await connectMongoDB();
        // await connectRedis();
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error instanceof Error ? error.message : String(error));
        console.error('Full error:', error);
        process.exit(1);
    }
}
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error instanceof Error ? error.message : String(error));
    console.error('Full error:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason instanceof Error ? reason.message : String(reason));
    console.error('Full reason:', reason);
    process.exit(1);
});
startServer();
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
});
//# sourceMappingURL=index.js.map