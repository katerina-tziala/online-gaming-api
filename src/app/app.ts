import { IncomingMessage, Server } from "http";
import * as WebSocket from "ws";

import { ConnectionGuard } from "./utilities/connection-guard";
import { Client } from "./utilities/client";
import { MessageIn } from "./messages/message.interface";
import { MessageInType } from "./messages/message-types.enum";
import { UserData } from "./interfaces/user-data.interface";
import { MainSession } from "./session/session-main";
import { GamingHost } from "./utilities/gaming-host";
export class OnlineGamingAPI {
  private WebSocketServer: WebSocket.Server;
  private _session: MainSession;
  private _GamingHosts = new Map();

  constructor(port: number) {
    // this.WebSocketServer = new WebSocket.Server({ server });
    this.WebSocketServer = new WebSocket.Server({ port: 9000 });
  }

  private set gamingHost(host: GamingHost) {
    this._GamingHosts.set(host.id, host);
  }

  private getGamingHost(hostId: string): GamingHost {
    if (!hostId) {
      throw Error("no host id");
    }
    const selectedHost = this._GamingHosts.get(hostId);
    if (!selectedHost) {
      this.gamingHost = new GamingHost(hostId);
    }
    return this._GamingHosts.get(hostId);
  }

  init(): void {
    let client: Client;
    this.WebSocketServer.on(
      "connection",
      (conn: WebSocket, connectionMessage: IncomingMessage) => {
        // console.log(connectionMessage.headers);
        // ws://localhost:9000
        // const gamingHost = connectionMessage.headers.origin;
        const gamingHost = "gamingHost";
        // console.log("gamingHost", connectionMessage.headers.origin);

        client = new Client(conn, gamingHost);
        conn.on("message", (msg: string) =>
          this.messageHandler(client, JSON.parse(msg))
        );

        // console.log(this.gamingHosts);
        // let client: Client;
        // if (ConnectionGuard.authenticatedClient(connectionMessage.headers)) {
        //     client = new Client(conn);
        //     conn.on("message", (msg: string) => this.messageHandler(client, JSON.parse(msg)));
        // } else {
        //     this.WebSocketServer.close();
        // }
        conn.on("close", () => this.disconnect(client));
      }
    );
    this.WebSocketServer.on("error", (event) => {
      console.log("websocket error");
      console.log(event);
    });
  }

  private messageHandler(client: Client, msg: MessageIn): void {
    if (!client || !msg) {
      console.log("error on message");
      throw Error("error on message");
    }

    const host = this.getGamingHost(client.origin);
    switch (msg.type) {
      case MessageInType.Join:
        host.joinClient(client, msg.data);
        break;
      case MessageInType.Disconnect:
        this.disconnect(client);
        break;

      //
      default:
        console.log("message");
        console.log("-------------------------");
        console.log(msg);
        console.log(client.details);
        break;
    }
  }

  private disconnect(client: Client): void {
    console.log("disconnect");

    const host = this.getGamingHost(client.origin);
    const destroyHost = host.removeClient(client);
    if (destroyHost) {
      this._GamingHosts.delete(host.id);
    }
  }
}
