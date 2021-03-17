import express from "express";
import cors from "cors";
import http from "http";
import { CONFIG } from "./config/config";
// import { OnlineGamingAPI } from "./app/app";
import * as WebSocket from "ws";
import { IncomingMessage, Server } from "http";
import { GamingHost } from "./app/utilities/gaming-host";
import { Client } from "./app/utilities/client";
import { MessageIn } from "./app/messages/message.interface";
import { MessageInType } from "./app/messages/message-types.enum";

const server = new WebSocket.Server({ port: CONFIG.PORT });
console.log(`Server is listening on port ${CONFIG.PORT}:)`);

const GamingHosts = new Map();

server.on(
  "connection",
  (conn: WebSocket, connectionMessage: IncomingMessage) => {
    // console.log("Connection established", connectionMessage);

    const clientOrigin = connectionMessage.headers.origin;
    console.log("clientOrigin:", clientOrigin);

    const gamingHost = "gamingHost";
    const client = new Client(conn, gamingHost);
    conn.on("message", (msg: string) =>
      messageHandler(client, JSON.parse(msg))
    );

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

function getClientHost(client: Client): GamingHost {
  if (!client) {
    return;
  }
  return getGamingHost(client.host);
}

function messageHandler(client: Client, msg: MessageIn): void {
  const { type, data } = msg;

  if (!client || !type || !data) {
    console.log("error on message");
    // throw Error("error on message");
  }

  if (type === MessageInType.Disconnect) {
    disconnect(client);
  }
  const host = getClientHost(client);
  if (type === MessageInType.Join) {
    host.joinClient(client, msg);
   return;
  }
  host.onMessage(client, msg);
}

function disconnect(client: Client): void {
  if (!client) {
    return;
  }
  const host = getClientHost(client);
  host.disconnectClient(client);
  if (!host.hasClients) {
    GamingHosts.delete(host.id);
  }
}
