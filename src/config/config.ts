import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
    SOCKET_PROTOCOL: "json",
    PORT: process.env.PORT,
    APP_PROTOCOL: process.env.APP_PROTOCOL,
    ALLOWED_HOST: process.env.ALLOWED_HOST,
    ID_GENERATION: {
        LENGTH: 32,
        CHARS: "abcdefghjkmnopqrstvwxyz01234567890ABCDEFGHJKMNOPQRSTVWXYZ"
    }
}