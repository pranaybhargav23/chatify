import "dotenv/config";

export const ENV = {
    PORT: process.env.PORT || 5000,
    MONGODB_URL: process.env.MONGODB_URL || '',
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    EMAIL_FROM: process.env.EMAILFROM || '',
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Messenger App',
};