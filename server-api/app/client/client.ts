
import * as WebSocket from 'ws';
import { Chat } from '../chat.interface';
import { ErrorType } from '../error-type.enum';
import { MessageInType, MessageOutType } from '../messages/message-types/message-types';
import { ErrorMessage, MessageIn, MessageOut } from '../messages/message.interface';
import { IdGenerator } from '../utils/id-generator';
import { UsernameValidator, ValidTypes } from '../validators/validators';
import { ClientData } from './client-data.interface';

export class Client {
  private _conn: WebSocket;
  private _id: string;
  private _username: string;
  private _gameId: string;
  private _joinedAt: string;
  private _properties: {};

  constructor(id?: string) {
    this._id = id || 'user-' + IdGenerator.generate();
    this._username = null;
    this._gameId = null;
  }

  public set conn(conn: WebSocket) {
    this._conn = conn;
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

  public set gameId(value: string) {
    this._gameId = value;
  }

  public get gameId(): string {
    return this._gameId;
  }

  public get connected(): boolean {
    return this._conn && this._conn.readyState === 1;
  }

  public set properties(value: {}) {
    this._properties = ValidTypes.typeOfObject(value) ? value : undefined;
  }

  public get properties(): {} {
    return this._properties;
  }

  public get basicInfo(): ClientData {
    return {
      id: this.id,
      username: this.username
    };
  }

  public get info(): ClientData {
    return {
      ...this.basicInfo,
      inGame: !!this.gameId,
      properties: this.properties
    };
  }

  public get details(): ClientData {
    return {
      ...this.info,
      joinedAt: this._joinedAt
    };
  }

  public setJoined(): void {
    this._joinedAt = new Date().toString();
  }

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

  public sendGameNotFound(gameRoomId: string, messageType = MessageInType.Join): void {
    this.sendErrorMessage(ErrorType.GameNotFound, { gameRoomId, messageType });
  }

  public sendUserInfo(): void {
    this.sendMessage(MessageOutType.UserInfo, this.info);
  }

  public sendPrivateChat(chatMessage: Chat): void {
    this.sendMessage(MessageOutType.PrivateChat, chatMessage);
  }

  public usernameUpdated(value: any, prohibitedUsernames: string[] = []): boolean {
    const { errorType, ...validationData } = UsernameValidator.validate(value, prohibitedUsernames);
    if (errorType) {
      this.sendErrorMessage(errorType, validationData);
      return false;
    }
    this.username = validationData.value;
    return true;
  }

  public updated(data: ClientData, prohibitedUsernames: string[] = []): boolean {
    const { username, properties } = data;
    if (this.updateDataDefined(username, properties)) {
      this.properties = properties;
      return username ? this.usernameUpdated(username, prohibitedUsernames) : true;
    }
    this.sendErrorMessage(ErrorType.UsernameOrPropertiesUpdate);
    return false;
  }

  private updateDataDefined(username: any, properties: {}): boolean {
    return (username || properties) ? true : false;
  }

  public allowedToSendGameMessage(messageType: MessageInType): boolean {
    if (!this.gameId) {
      this.sendErrorMessage(ErrorType.NotInGame, { messageType });
      return false;
    }
    return true;
  }

}
