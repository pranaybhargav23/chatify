import {Server} from 'socket.io';
import http from 'http';
import { ENV } from './env.js';
import express from 'express';
import { socketAuthMiddleware } from '../middleware/socket.auth.middleware.js';

const app = express();
const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin:[ENV.CLIENT_URL],
        credentials:true,
    },

});

//apply authentication middleware to all  socket connections
io.use(socketAuthMiddleware);


//we will use this function to check if the user is online or not

export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}

// this is for online users 
const userSocketMap = {}; // userId:SocketId

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.fullName} (${socket.user._id})`);
  
    const userId = socket.userId;
    userSocketMap[userId] = socket.id;


    //io.emit() is used to send message to all connected clients
    io.emit('getOnlineUsers', Object.keys(userSocketMap));


    // with socket.on we can listen to events from clients
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.fullName} (${socket.user._id})`);
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});



export {io,app,server}