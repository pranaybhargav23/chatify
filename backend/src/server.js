import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';
import { app, server } from './lib/socket.js';
import cors from 'cors';



const PORT = ENV.PORT || 3000;


app.use(express.json({limit:'5mb'}));
app.use(cors({
    origin: ENV.NODE_ENV === 'development' 
        ? ['http://localhost:5173', 'http://localhost:5174'] 
        : ENV.CLIENT_URL, 
    credentials: true
}));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

server.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});