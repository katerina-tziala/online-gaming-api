import dotenv from "dotenv";
dotenv.config();

export class Config {

    static SOCKET_PROTOCOL = "json";

    static PORT = process.env.PORT;

    static APP_PROTOCOL = process.env.APP_PROTOCOL;

}