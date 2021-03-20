import * as WebSocket from "ws";
import {
  ClientData,
  ClientUpdateData
} from "../interfaces/user-data.interface";
import {
  MessageErrorType,
  MessageOutType,
} from "../messages/message-types.enum";
import { generateId } from "./app-utils";

export class Client {
  private _conn: WebSocket;
  private _host: string;
  private _id: string;
  private _username: string;
  private _gameRoomId: string;
  private _properties: {};
  private _joinedAt: string;

  constructor(conn: WebSocket, origin: string) {
    this._conn = conn;
    this._host = origin;
    this._id = generateId();
    this._username = null;
    this._gameRoomId = null;
    this._joinedAt = new Date().toString();
  }

  public get host(): string {
    return this._host;
  }

  public get id(): string {
    return this._id;
  }

  public set username(value: string) {
    this._username = value;
  }

  public get username(): string {
    return this._username;
  }

  public set gameRoomId(value: string) {
    this._gameRoomId = value;
  }

  public get gameRoomId(): string {
    return this._gameRoomId;
  }

  public get connected(): boolean {
    return this.conn && this.conn.readyState === 1;
  }

  public set properties(value: {}) {
    this._properties = value;
  }

  public get properties(): {} {
    return this._properties;
  }

  private get conn(): WebSocket {
    return this._conn;
  }

  public get info(): ClientData {
    return {
      id: this.id,
      username: this.username,
      gameRoomId: this.gameRoomId,
      joinedAt: this._joinedAt,
      properties: this.properties,
    };
  }

  public update(data: ClientUpdateData): void {
    this.username = data.username || this.username;
    this.properties = data.properties || this.properties;
  }

  // /* ~~~~~~~~~~~~~~~~~~~~~~~ SEND CLIENT MESSAGES ~~~~~~~~~~~~~~~~~~~~~~~ */
  private send(data: {}): void {
    this.conn.send(JSON.stringify(data), (error) => {
      if (error) {
        console.log("client is not connected -> cannot deliver the message");
        console.log(error);
      }
    });
  }

  public notify(type: MessageOutType, data: {}): void {
    if (!this.connected) {
      console.log("client is not connected -> cannot deliver the message");
      return;
    }
    this.send({ type, data });
  }

  public sendError(errorType: MessageErrorType, messageFailed: {}): void {
    this.notify(MessageOutType.Error, { errorType, messageFailed });
  }


}
