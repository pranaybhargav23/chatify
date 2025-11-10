import mongoose from 'mongoose';


export const connectDB = async () =>{
    try{
        const {MONGODB_URL} = process.env;
        if(!MONGODB_URL){
            throw new Error('MONGODB_URL is not defined in environment variables');
        }
        await mongoose.connect(process.env.MONGODB_URL || '');
        console.log('MongoDB connected successfully');
    }catch(err){
        console.log('MongoDB connection failed');
        console.error(err);
        process.exit(1); // 1 status code for failure, 0 for success
    }
};