import express from "express";
import cors from "cors";
import http from "http";
import { CONFIG } from "./config/config";
import { OnlineGamingAPI } from "./app/app";

const appServer = express().use(cors());
const server = http.createServer(appServer);

server.listen(CONFIG.PORT, () => {
    const api = new OnlineGamingAPI(server);
    console.log(`Server is listening on port ${CONFIG.PORT} :)`);
});