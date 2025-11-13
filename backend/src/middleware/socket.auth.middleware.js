import jwt from 'jsonwebtoken';
import { ENV } from '../lib/env.js';
import User from '../models/User.js';

export const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.headers.cookie?.split(";").find((row)=>row.startsWith("jwt="))?.split("=")[1];

        if (!token) {
            return next(new Error('Authentication error: Token not provided'));
        }
        //verify the token
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if(!decoded){
            return next(new Error('Authentication error: Invalid token'));
        }

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }  
        
        // Attach user info to socket object
        socket.user = user; // Attach user to socket object
        socket.userId = user._id.toString();

        console.log(`Socket authenticated for user: ${user.fullName} (${user._id})`);
        
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error'));
    }
}