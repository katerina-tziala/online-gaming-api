import * as WebSocket from "ws";
import { InviteAndOpenRoom } from "../interfaces/game-room.interfaces";
import { Invitation } from "../interfaces/invitation.interface";

import { UserData, UserInfo } from "../interfaces/user-data.interface";
import {
  MessageErrorType,
  MessageOutType,
} from "../messages/message-types.enum";
import { MessageOut } from "../messages/message.interface";
import { generateId } from "./app-utils";

export class Client {
  private _conn: WebSocket;
  private _origin: string;
  private _id: string;
  private _username: string;
  private _gameRoomId: string;
  private _properties: {};
  private invitations: Invitation[] = [];


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

  public get details(): UserInfo {
    return {
      id: this.id,
      username: this.username,
      gameRoomId: this.gameRoomId,
      properties: this.properties,
    };
  }

  public get userData(): UserData {
    return {
      id: this.id,
      username: this.username,
      gameRoomId: this.gameRoomId,
      origin: this.origin,
      invitations: this.invitations,
      properties: this.properties,
    };
  }

  public get connected(): boolean {
    return this.conn && this.conn.readyState === 1;
  }

  public update(data: UserData): void {
    this.username = data.username || this.username;
    this.id = data.id || this.id;
    this.properties = data.properties || this.properties;
  }


  public geReceivedInvitation(invitationId: string): Invitation {
    return this.invitations.find(
      (invitation) => invitation.id === invitationId
    );
  }

  public removeInvitation(invitationId: string): void {
    this.invitations = this.invitations.filter(
      (invitation) => invitation.id !== invitationId
    );
  }

  public rejectInvitation(invitation: Invitation): void {
    this.removeInvitation(invitation.id);
    const data = {
      rejectedInvitation: invitation,
      invitations: this.invitations,
    };
    this.notify(MessageOutType.InvitationRejected, data);
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~ SEND CLIENT MESSAGES ~~~~~~~~~~~~~~~~~~~~~~~ */
  private send(data: MessageOut): void {
    this.conn.send(JSON.stringify(data), (error) => {
      if (!this.connected) {
        console.log("client is not connected -> cannot deliver the message");
        return;
      }
      if (error) {
        console.log("client is not connected -> cannot deliver the message");
        console.log(error);
      }
    });
  }

  public notify(type: MessageOutType, data: {}): void {

    this.send({ type, data });
  }

  public sendMessageFailed(errorType: MessageErrorType, messageFailed: {}): void {
    this.notify(MessageOutType.MessageFailed, { errorType, messageFailed });
  }

  public sendRecipientNotConnected(message: {}): void {
    this.sendMessageFailed(MessageErrorType.RecipientNotConnected, message);
  }

  // Messages For Invitations
  public sendInvitationRejected(invitation: Invitation): void {
    const data = {
      deletedInvitation: invitation,
      invitations: this.invitations,
    };
    this.notify(MessageOutType.InvitationRejected, data);
  }

  public invitationDenied(sender: UserData, invitation: Invitation): void {
    this.notify(MessageOutType.InvitationDenied, {sender, invitation});
  }

  public invitationRemoved(sender: UserData, invitation: Invitation): void {
    this.notify(MessageOutType.InvitationRemoved, {sender, invitation});
  }

  public sendInvitation(invitation: Invitation): void {
    this.invitations.push(invitation);
    this.notify(MessageOutType.Invitation, invitation);
  }

  public noRecipiendsSpecified(data: InviteAndOpenRoom): void {
    this.sendMessageFailed(MessageErrorType.NoRecipientsSpecified, data);
  }

  public invitationRecipiendsDisconnected(disconnectedRecipients: string[]): void {
    this.sendMessageFailed(MessageErrorType.RecipientsDisconnected, {disconnectedRecipients});
  }


  public sendMessage(data: MessageOut): void {
    if (!this.connected) {
      console.log("client is not connected -> cannot deliver the message");
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
      type: MessageOutType.Error,
      data: {
        errorType: MessageErrorType.UsernameInUse,
      },
    });
  }

  public sendUserJoined(peers: UserData[]): void {
    this.sendMessage({
      type: MessageOutType.Joined,
      data: {
        user: this.userData,
        peers,
      },
    });
  }

  public sendUserUpdate(peers: UserData[]): void {
    this.sendMessage({
      type: MessageOutType.User,
      data: {
        user: this.userData,
        peers,
      },
    });
  }

  public sendPeersNotification(peers: UserData[]): void {
    this.sendMessage({
      type: MessageOutType.Peers,
      data: {
        peers,
      },
    });
  }

  public sendUsernameRequired(message: {}): void {
    this.sendMessage({
      type: MessageOutType.Error,
      data: {
        errorType: MessageErrorType.UsernameRequired,
        messageFailed: message,
      },
    });
  }

  public sendPrivateMessage(sender: UserData, message: {}): void {
    this.sendMessage({
      type: MessageOutType.PrivateMessage,
      data: { sender, message },
    });
  }
}
