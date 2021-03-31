
import * as WebSocket from 'ws';
import { IdGenerator } from '../../utils/id-generator';

import { ClientData } from './client-data.interface';

import { MessageOutType } from '../messages/message-types/message-types.enum';
import { ErrorType } from '../error-type.enum';
import { ErrorMessage, MessageOut } from '../messages/message.interface';

export class Client {
  private _conn: WebSocket;
  private _id: string;
  private _username: string;
  private _gameRoomId: string;
  private _joinedAt: string;
  private _properties: {};

  constructor(conn: WebSocket) {
    this._conn = conn;
    this._id = IdGenerator.generate();
    this._username = null;
    this._gameRoomId = null;
  }

  public get joined(): boolean {
    return !!this._joinedAt;
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
    return this._conn && this._conn.readyState === 1;
  }

  public set properties(value: {}) {
    this._properties = value;
  }

  public get properties(): {} {
    return this._properties;
  }

  public get info(): ClientData {
    return {
      id: this.id,
      username: this.username,
      gameRoomId: this.gameRoomId,
      joined: this.joined,
      joinedAt: this._joinedAt,
      properties: this.properties
    };
  }

  public setJoined(): void {
    this._joinedAt = new Date().toString();
  }

  // public update(data: ClientUpdateData): void {
  //   this.username = data.username || this.username;
  //   this.properties = data.properties || this.properties;
  // }

  // /* ~~~~~~~~~~~~~~~~~~~~~~~ SEND CLIENT MESSAGES ~~~~~~~~~~~~~~~~~~~~~~~ */
  private send<T>(message: T): void {
    if (!this.connected) {
        console.log('client is not connected -> cannot deliver the message');
        return;
      }

    this._conn.send(JSON.stringify(message), (error) => {
      if (error) {
        console.log('error in delivering the message -> ', error);
      }
    });
  }

  public sendMessage(type: MessageOutType, data: {}): void {
    this.send<MessageOut>({ type, data });
  }

  public sendErrorMessage(errorType: ErrorType, data?: {}): void {
    const type = MessageOutType.Error;
    this.send<ErrorMessage>({ type, errorType, data });
  }

  public sendUserInfo(): void {
    this.sendMessage(MessageOutType.UserInfo, this.info);
  }
}
