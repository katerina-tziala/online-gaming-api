import * as WebSocket from "ws";

import { UserData } from "../interfaces/user-data.interface";
import { MessageOutType } from "../messages/message-types.enum";
import { MessageOut } from "../messages/message.interface";
import { generateId } from "./app-utils";

export class Client {
  private _conn: WebSocket;
  private _origin: string;
  private _id: string;
  private _username: string;
  private _gameRoomId: string;
  private _properties: {};

  constructor(conn: WebSocket, origin: string) {
    this.conn = conn;
    this.origin = origin;
    this.id = generateId();
    this.username = null;
    this.gameRoomId = null;
  }

  public set conn(server: WebSocket) {
    this._conn = server;
  }

  public get conn(): WebSocket {
    return this._conn;
  }

  public set origin(origin: string) {
    this._origin = origin;
  }

  public get origin(): string {
    return this._origin;
  }

  public set gameRoomId(value: string) {
    this._gameRoomId = value;
  }

  public get gameRoomId(): string {
    return this._gameRoomId;
  }

  public set id(value: string) {
    this._id = value;
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

  public set properties(value: {}) {
    this._properties = value;
  }

  public get properties(): {} {
    return this._properties;
  }

  public get details(): UserData {
    return {
      id: this.id,
      username: this.username,
      gameRoomId: this.gameRoomId,
      origin: this.origin,
      properties: this.properties
    };
  }

  public update(data: UserData): void {
    this.username = data.username || this.username;
    this.id = data.id || this.id;
    this.properties = data.properties || this.properties;
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~ SEND CLIENT MESSAGES ~~~~~~~~~~~~~~~~~~~~~~~ */
  public get connected(): boolean {
    return this.conn && this.conn.readyState === 1;
  }

  public sendMessage(data: MessageOut): void {
    if (!this.connected) {
      // throw new Error("client is not connected");
      console.log("client is not connected");
      console.log(this.username);
      return;
    }
    this.conn.send(JSON.stringify(data), (error) => {
      if (error) {
        console.log(error);
        throw new Error();
      }
    });
  }

  public sendUsernameInUse(): void {
    this.sendMessage({
      type: MessageOutType.UsernameInUse,
      data: {},
    });
  }

  public sendUserUpdate(data: {}): void {
    this.sendMessage({
      type: MessageOutType.User,
      data,
    });
  }

  public sendPeersNotification(peers: UserData[]): void {
    this.sendMessage({
        type: MessageOutType.Peers,
        data: {
            peers
        }
    });
  }
}
