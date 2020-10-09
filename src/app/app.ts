import { Server } from "http";
import * as WebSocket from "ws";

export class OnlineGamingAPI {
    private WebSocketServer: WebSocket.Server;

    constructor(server: Server) {
        this.WebSocketServer = new WebSocket.Server({ server });
        this.init();
    }

    init() {
        this.WebSocketServer.on("connection", (conn: Server, socket: WebSocket) => {
            console.log(conn, socket);

        });
    }

}