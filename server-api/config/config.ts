import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
    PORT: parseInt(process.env.PORT, 10),
    FALLBACK: parseInt(process.env.FALLBACK, 10),
    PROTOCOLS: [process.env.APP_PROTOCOL, process.env.SOCKET_PROTOCOL]
}