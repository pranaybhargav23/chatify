import jwt from 'jsonwebtoken';
import { ENV } from './env.js';

export const generateToken = (userId, response) => {
    if (!ENV.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const token = jwt.sign({ userId }, ENV.JWT_SECRET, { expiresIn: '7d' });
    response.cookie('jwt', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: "strict",
        secure: ENV.NODE_ENV !== 'development',
    });
    return token;
}


//http://localhost:3000
//https://chatify-app.com