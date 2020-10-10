
import { IncomingMessage, Server } from "http";
import * as WebSocket from "ws";

import { ConnectionGuard } from './utilities/connection-guard';
import { Client } from "./utilities/client";
import { MessageIn } from "./messages/message.interface";
import { MessageInType } from "./messages/message-types.enum";
import { UserData } from "./interfaces/user-data.interface";
import { MainSession } from "./session/session-main";

export class OnlineGamingAPI {
    private WebSocketServer: WebSocket.Server;
    private _session: MainSession;

    constructor(server: Server) {
        this.WebSocketServer = new WebSocket.Server({ server });
        this.init();
    }

    set session(session: MainSession) {
        this._session = session;
    }

    get session(): MainSession {
        if (!this._session) {
            this.session = new MainSession();
        }
        return this._session;
    }

    init(): void {
        this.WebSocketServer.on("connection", (conn: WebSocket, connectionMessage: IncomingMessage) => {
            let client: Client;
            if (ConnectionGuard.authenticatedClient(connectionMessage.headers)) {
                client = new Client(conn);
                conn.on("message", (msg: string) => this.messageHandler(client, JSON.parse(msg)));
            } else {
                this.WebSocketServer.close();
            }
            conn.on("close", () => {
                this.disconnect(client);
            });
        });
    }

    messageHandler(client: Client, msg: MessageIn): void {
        console.log("message");
        console.log("-------------------------");
        // console.log(msg);
        if (client && msg) {
            switch (msg.type) {
                case MessageInType.Login:
                    this.loginClient(client, msg.data);
                    break;


            }
        }

    }

    loginClient(client: Client, data: UserData): void {
        const usernamesInUse = this.session.usernamesInUse;
        client.update(data);
        if (usernamesInUse.includes(client.username)) {
            client.sendUsernameInUse();
        } else {
            this.session.addClient(client);
        }
    }

    disconnect(client: Client): void {
        // TODO: terminate games
        // TODO:  handle invitations
        console.log("disconnect");
        // console.log(client);
        if (client) {
            this.session.removeClient(client);
        }
    }
}