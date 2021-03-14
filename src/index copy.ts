import express from "express";
import cors from "cors";
import http from "http";
import { CONFIG } from "./config/config";
import { OnlineGamingAPI } from "./app/app";
import * as WebSocket from "ws";
import { IncomingMessage, Server } from "http";
import { GamingHost } from "./app/utilities/gaming-host";
import { Client } from "./app/utilities/client";
import { MessageIn } from "./app/messages/message.interface";
import { MessageInType } from "./app/messages/message-types.enum";
// const appServer = express().use(cors());
// const server = http.createServer(appServer);
//
// server.listen(CONFIG.PORT, () => {
//     const api = new OnlineGamingAPI(parseInt(CONFIG.PORT, 10));
//     console.log(`Server is listening on port ${CONFIG.PORT} :)`);
// });
// const API = new OnlineGamingAPI(parseInt(CONFIG.PORT, 10));
// API.init();
// const _GamingHosts = new Map();
// // private set gamingHost(host: GamingHost) {
// //     this._GamingHosts.set(host.id, host);
// //   }

// //   private getGamingHost(hostId: string): GamingHost {
// //     if (!hostId) {
// //       throw Error("no host id");
// //     }
// //     const selectedHost = this._GamingHosts.get(hostId);
// //     if (!selectedHost) {
// //       this.gamingHost = new GamingHost(hostId);
// //     }
// //     return this._GamingHosts.get(hostId);
// //   }
const server = new WebSocket.Server({ port: CONFIG.PORT });
console.log(`Server is listening on port ${CONFIG.PORT} :)`);

const GamingHosts = new Map();

server.on(
  "connection",
  (conn: WebSocket, connectionMessage: IncomingMessage) => {
    // console.log("Connection established", connectionMessage);
    // const client = createClient(conn);
    const gamingHost = "gamingHost";
    const client = new Client(conn, gamingHost);
    conn.on("message", (msg: string) =>  messageHandler(client, JSON.parse(msg)));

    conn.on("close", () => disconnect(client));
  }
);

server.on("error", (event: any) => {
  console.log("websocket error");
  console.log(event);
});

function setGamingHost(host: GamingHost) {
  GamingHosts.set(host.id, host);
}

function getGamingHost(hostId: string): GamingHost {
  if (!hostId) {
    throw Error("no host id");
  }
  const selectedHost = GamingHosts.get(hostId);
  if (!selectedHost) {
    setGamingHost(new GamingHost(hostId));
  }
  return GamingHosts.get(hostId);
}

function messageHandler(client: Client, msg: MessageIn): void {
  if (!client || !msg) {
    console.log("error on message");
    throw Error("error on message");
  }

  const host = getGamingHost(client.origin);
  switch (msg.type) {
    case MessageInType.Join:
      host.joinClient(client, msg.data);
      break;
    default:
      console.log("message");
      console.log("-------------------------");
      console.log(msg);
      console.log(client.details);
      break;
  }
}

function disconnect(client: Client): void {
  console.log("disconnect");

  const host = getGamingHost(client.origin);
  // console.log(client.conn);

  // const destroyHost = host.removeClient(client);
  // if (destroyHost) {
  //   GamingHosts.delete(host.id);
  // // }
  // console.log("destroyHost", destroyHost);

  console.log("_GamingHosts", GamingHosts);
}
