import dotenv from 'dotenv';

dotenv.config();

export const SERVER_HOST = process.env.SERVER_HOST || 'localhost';
export const SERVER_PORT = parseInt(process.env.SERVER_PORT || '3000', 10);
