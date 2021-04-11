import { stringToJSON } from "./utils/utils";
import { Client } from "./client/client";
import { ErrorType } from "./error-type.enum";
import { MessageInType } from "./messages/message-types/message-types";
import { MessageIn } from "./messages/message.interface";
import { HostSession } from "./session/host-session";
import * as WebSocket from "ws";
import { IncomingMessage } from "http";
import { Socket } from "net";

export class OnlineGamingHost {
  private _ALLOWED_MESSAGES: string[] = Object.values(MessageInType);
  private _mainSession: HostSession;
  public wsServer: WebSocket.Server;
  public origin: string;
  public port: number;
  public onAllClientsLeft: (origin: string) => void;

  constructor(origin: string, port: number, onAllClientsLeft: (origin: string) => void) {
    this.origin = origin;
    this.port = port;
    this.onAllClientsLeft = onAllClientsLeft;
    this._mainSession = new HostSession();
    this.initWebSocket();
  }

  private initWebSocket(): void {
    this.wsServer = new WebSocket.Server({ port: this.port, noServer: true });
    this.wsServer.on("connection", (conn: WebSocket) => this.onConnection(conn));
    this.wsServer.on("error", (event) => this.onError(event));
  }

  private onConnection(conn: WebSocket): void {
    const client = new Client(conn);
    conn.on("message", (msg: string) => this.onMessage(client, msg));
    conn.on("close", () => this.disconnect(client));
  }

  private onError(event: any): void {
    // TODO:
    console.log("websocket error", event);
    this.onAllClientsLeft(this.origin);
  }

  public handleUpgrade(request: IncomingMessage, socket: Socket, head: Buffer) {
    this.wsServer.handleUpgrade(request, socket, head, (webSocket) => {
      this.wsServer.emit("connection", webSocket, request);
    });
  }

  private messageTypeAllowed(type: MessageInType): boolean {
    return this._ALLOWED_MESSAGES.includes(type);
  }

  private handleMessage(client: Client, message: MessageIn): void {
    const { type } = message;
    if (type === MessageInType.UserInfo) {
      this.onGetClientInfo(client);
    } else {
      this._mainSession.onMessage(client, message);
    }
  }

  private onGetClientInfo(client: Client): void {
    if (client) {
      client.sendUserInfo();
    }
  }

  private sendAllowedMessagesError(client: Client): void {
    client.sendErrorMessage(ErrorType.MessageTypeAllowed, {
      allowedTypes: this._ALLOWED_MESSAGES,
    });
  }

  private checkMessageTypeAndHandle(client: Client, message: MessageIn): void {
    const { type } = message;
    if (!type) {
      client.sendErrorMessage(ErrorType.MessageTypeExpected);
    } else if(!this.messageTypeAllowed(type)) {
      this.sendAllowedMessagesError(client);
    } else {
      this.handleMessage(client, message);
    }
  }

  private onMessage(client: Client, messageString: string): void {
    const messageData = stringToJSON<MessageIn>(messageString);
    if (!messageData) {
      client.sendErrorMessage(ErrorType.JSONDataExcpected);
      return;
    }
    this.checkMessageTypeAndHandle(client, messageData);
  }

  private disconnect(client: Client): void {
    if (!client) {
      return;
    }
    this._mainSession.disconnectClient(client);
    this.checkClientsExistence();
  }

  private checkClientsExistence(): void {
    if (!this._mainSession.hasClients) {
      this.onAllClientsLeft(this.origin);
    }
  }

}
