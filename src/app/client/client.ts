
import * as WebSocket from "ws";
import { IdGenerator } from "../../utils/id-generator";
import { ClientData } from "./client-data.interface";
import { MessageOutType } from "../messages/message-types/message-types.enum";
import { ErrorType } from "../error-type.enum";
import { ErrorMessage, MessageOut } from "../messages/message.interface";
import { UsernameValidator, validObject } from "../validators/validators";
import { Chat } from "../chat.interface";

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
    this._properties = validObject(value) ? value : undefined;
  }

  public get properties(): {} {
    return this._properties;
  }

  public get info(): ClientData {
    return {
      id: this.id,
      username: this.username,
      gameRoomId: this.gameRoomId,
      joinedAt: this._joinedAt,
      properties: this.properties
    };
  }

  public setJoined(): void {
    this._joinedAt = new Date().toString();
  }

  private send<T>(message: T): void {
    if (!this.connected) {
        console.log("client is not connected -> cannot deliver the message");
        return;
      }

    this._conn.send(JSON.stringify(message), (error) => {
      if (error) {
        console.log("error in delivering the message -> ", error);
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

  public sendGameNotFound(gameRoomId: string): void {
    this.sendErrorMessage(ErrorType.GameNotFound, { gameRoomId });
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
    return false;
  }

  private updateDataDefined(username: any, properties: {}): boolean {
    if (!username && !properties) {
      this.sendErrorMessage(ErrorType.UsernameOrPropertiesUpdate);
      return false;
    }
    return true;
  }

}
