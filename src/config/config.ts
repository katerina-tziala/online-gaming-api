import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
    SOCKET_PROTOCOL: process.env.SOCKET_PROTOCOL,
    PORT: parseInt(process.env.PORT, 10),
    APP_PROTOCOL: process.env.APP_PROTOCOL,
    ALLOWED_HOST: process.env.ALLOWED_HOST
}