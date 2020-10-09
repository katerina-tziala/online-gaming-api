import express from "express";
import cors from "cors";
import http from "http";
import { Config } from "./utilities/config";
import { OnlineGamingAPI } from "./app/app";

const appServer = express().use(cors());
const server = http.createServer(appServer);

server.listen(Config.PORT, () => {
    const api = new OnlineGamingAPI(server);
    console.log(`Server is listening on port ${Config.PORT} :)`);
});