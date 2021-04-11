import express, { Request, Response } from "express";
import { CONFIG } from "./config/config";
import { OnlineGamingApp } from "./app/online-gaming-app";
import { Socket } from "net";
import { ConnectionGuard } from "./app/connection-guard";
import { IncomingMessage } from "http";

const port = CONFIG.PORT;
const OnlineGaming = new OnlineGamingApp();

const app = express();

app.get("/", async (req: Request, res: Response, next) => {
  res.send("~~ Onlie Gaming API ~~");
  // TODO: PRINT INFO
});

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}!`);
});

server.on("upgrade", (request: IncomingMessage, socket: Socket, head: Buffer) => {
  if (ConnectionGuard.connectionAllowed(request)) {
    OnlineGaming.onOriginConnection(request, socket, head);
  } else {
    socket.end();
  }
});
