import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async () => {
    try {
        if (!ENV.MONGODB_URL) {
            throw new Error('MONGODB_URL is not defined in environment variables');
        }
        await mongoose.connect(ENV.MONGODB_URL);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.log('MongoDB connection failed');
        console.error(err);
        process.exit(1); // 1 status code for failure, 0 for success
    }
};