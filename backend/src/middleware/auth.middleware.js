import jwt from 'jsonwebtoken';
import { ENV } from '../lib/env.js';
import User from '../models/User.js';

export const protectRoute = async (request, response, next) => {
    try {
        const token = request.cookies.jwt;
        if (!token) {
            return response.status(401).json({ message: 'Unauthorized: No token provided' });
        }
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded) {
            return response.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return response.status(401).json({ message: 'Unauthorized: User not found' });
        }
        request.user = user;
        next();

    } catch (err) {

        console.error(err);
        return response.status(401).json({ message: 'Unauthorized: Token verification failed' });
    }
};