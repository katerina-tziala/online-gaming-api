import { stringToJSON } from './utils/utils';
import { Client } from './client/client';
import { ErrorType } from './error-type.enum';
import { MessageInType } from './messages/message-types/message-types';
import { MessageIn } from './messages/message.interface';
import { HostSession } from './session/host-session';
import * as WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { ConnectionHelper } from './connection-helper';
import { CONFIG } from '../config/config';
import { ReportInfo } from './report-info.interface';

export class OnlineGamingHost {
  private _ALLOWED_MESSAGES: string[] = Object.values(MessageInType);
  private _mainSession: HostSession;
  public wsServer: WebSocket.Server;
  public origin: string;
  public port: number;
  public onAllClientsLeft: (origin: string) => void;

  private _diconnectMap: Map<string, any> = new Map();

  constructor(origin: string, port: number, onAllClientsLeft: (origin: string) => void) {
    this.origin = origin;
    this.port = port;
    this.onAllClientsLeft = onAllClientsLeft;
    this._mainSession = new HostSession();
    this.initWebSocket();
  }

  public get info(): ReportInfo {
    const info = this._mainSession.info;
    info.origin = this.origin;
    info.port = this.port;
    return info;
  }

  private initWebSocket(): void {
    this.wsServer = new WebSocket.Server({ port: this.port, noServer: true });
    this.wsServer.on('connection', (conn: WebSocket, request: IncomingMessage) => this.onConnection(conn, request));
    this.wsServer.on('error', (event) => this.onError(event));
  }

  private generateClient(conn: WebSocket, request: IncomingMessage): Client {
    const userId: string = ConnectionHelper.getUserIdFromURL(request);
    const client = this._mainSession.getClientById(userId) || new Client(userId);
    client.conn = conn;
    this.cancelDsconnect(client.id);
    return client;
  }

  private onConnection(conn: WebSocket, request: IncomingMessage): void {
    const client = this.generateClient(conn, request);
    conn.on('message', (msg: string) => this.onMessage(client, msg));
    conn.on('close', () => this.onDisconnect(client));
  }

  private onError(event: any): void {
    console.log('websocket error', event);
    this.onAllClientsLeft(this.origin);
  }

  public handleUpgrade(request: IncomingMessage, socket: Socket, head: Buffer) {
    this.wsServer.handleUpgrade(request, socket, head, (webSocket) => {
      this.wsServer.emit('connection', webSocket, request);
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

  private onDisconnect(client: Client): void {
    if (!client) {
      return;
    }
    const timeout = setTimeout(() => this.disconnect(client), CONFIG.FALLBACK);
    this._diconnectMap.set(client.id, timeout);
  }

  private cancelDsconnect(clientId: string): void {
    if (this._diconnectMap.has(clientId)) {
      clearTimeout( this._diconnectMap.get(clientId));
      this._diconnectMap.delete(clientId)
    }
  }

  private disconnect(client: Client): void {
    this._mainSession.disconnectClient(client);
    this.checkClientsExistence();
    this.cancelDsconnect(client.id);
  }

  private checkClientsExistence(): void {
    if (!this._mainSession.hasClients) {
      this.onAllClientsLeft(this.origin);
    }
  }

}
