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

function messageHandler(client: Client, msg: MessageIn): void {
  if (!client || !msg || !msg.type) {
    console.log("error on message");
    // throw Error("error on message");
  }

  if (msg.type === MessageInType.Disconnect) {
    disconnect(client);
    return;
  }

  const host = getGamingHost(client.origin);
  switch (msg.type) {
    case MessageInType.Join:
      host.joinClient(client, msg.data);
      break;
    case MessageInType.UserUpdate:
      host.updateClient(client, msg.data);
      break;
    case MessageInType.PrivateMessage:
      host.sendPrivateMessage(client, msg.data);
      break;
    case MessageInType.InviteAndOpenRoom:
      host.inviteAndOpenRoom(client, msg.data);
      break;
    case MessageInType.RejectInvitation:
      host.rejectInvitation(client, msg.data.id);
      break;
    case MessageInType.AcceptInvitation:
      host.acceptInvitation(client, msg.data.id);
      break;
    case MessageInType.GameUpdate:
      host.submitGameUpdate(client, msg.data);
      break;
    case MessageInType.GameOver:
      host.submitGameOver(client, msg.data);
      break;
    case MessageInType.QuitGame:
      host.quitGame(client, msg.data.id);
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
  const host = getGamingHost(client.origin);
  const destroyHost = host.removeClient(client);
  if (destroyHost) {
    GamingHosts.delete(host.id);
  }
}
