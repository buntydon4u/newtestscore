import mongoose from 'mongoose';
export async function connectMongoDB() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        await mongoose.connect(mongoUri, {
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB connected successfully');
    }
    catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
}
export async function disconnectMongoDB() {
    try {
        await mongoose.disconnect();
        console.log('✅ MongoDB disconnected');
    }
    catch (error) {
        console.error('❌ Error disconnecting MongoDB:', error);
    }
}
export default mongoose;
//# sourceMappingURL=mongodb.js.map