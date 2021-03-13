import * as WebSocket from "ws";
import { GameConfig, InviteAndOpenRoom } from "../interfaces/game-room.interfaces";

import { UserData } from "../interfaces/user-data.interface";
import { InvitationCreation } from "../invitations/invitation-creation";
import {
  MessageErrorType,
  MessageOutType,
} from "../messages/message-types.enum";
import { MessageOut } from "../messages/message.interface";
import { GameRoomSession } from "../session/session-game-room";
import { MainSession } from "../session/session-main";
import { generateId, getNowTimeStamp } from "./app-utils";
import { Client } from "./client";
import { InvitationsController } from "./invitations-manager";

export class GamingHost {
  public id: string;
  private _MainSession: MainSession;
  private _GameRooms = new Map();

  constructor(id: string) {
    this.id = id;
  }

  set mainSession(session: MainSession) {
    this._MainSession = session;
  }

  get mainSession(): MainSession {
    if (!this._MainSession) {
      this.mainSession = new MainSession();
    }
    return this._MainSession;
  }

  set gameRooms(session: GameRoomSession) {
    this._GameRooms.set(session.id, session);
  }

  public getRoomSession(roomId: string): GameRoomSession {
    return this._GameRooms.get(roomId);
  }

  public removeRoomSession(session: GameRoomSession): void {
    this._GameRooms.delete(session.id);
  }

  private clientJoined(client: Client): boolean {
    if (!this._MainSession) {
      return false;
    }
    return this._MainSession.clientExists(client);
  }

  private usernameInData(data: UserData): boolean {
    return Object.keys(data).includes("username");
  }

  private clientUsernameInUse(client: Client, newUsername: string): boolean {
    let clientsToCheck = this.mainSession.clientsList;
    clientsToCheck = clientsToCheck.filter(
      (joinedClient) => joinedClient.id !== client.id
    );

    const usernamesInUse = clientsToCheck.map(
      (joinedClient) => joinedClient.username
    );

    if (usernamesInUse.includes(newUsername)) {
      client.sendUsernameInUse();
      return true;
    }
    return false;
  }

  public joinClient(client: Client, data: UserData): void {
    if (!this.usernameInData(data) || !data.username.length) {
      client.sendUsernameRequired(data);
      return;
    }

    if (this.clientUsernameInUse(client, data.username)) {
      client.sendUsernameInUse();
      return;
    }
    delete data.id;
    client.update(data);
    this.mainSession.addClient(client);
  }

  public updateClient(client: Client, data: UserData): void {
    if (this.usernameInData(data) && !data.username.length) {
      client.sendUsernameRequired(data);
      return;
    }

    if (this.clientUsernameInUse(client, data.username)) {
      client.sendUsernameInUse();
      return;
    }

    delete data.id;
    client.update(data);
    this.mainSession.updateClient(client);
  }

  public sendPrivateMessage(sender: Client, data: any): void {
    if (!this.clientAllowedToSendMessage(sender, data)) {
      return;
    }

    const recipient = this.mainSession.getClientById(data.recipientId);
    if (!recipient) {
      sender.sendRecipientNotConnected(data);
      return;
    }

    if (sender.id === recipient.id) {
      console.log("cannot send message to self");
      return;
    }

    recipient.sendPrivateMessage(sender.details, data.message);
  }

  private clientAllowedToSendMessage(sender: Client, data: any): boolean {
    if (!this.clientJoined(sender)) {
      sender.sendUsernameRequired(data);
      return false;
    }
    return true;
  }

  private clientAlredyInRoom(sender: Client): boolean {
    const gameRoom = this.getRoomSession(sender.gameRoomId);
    if (gameRoom) {
      sender.sendMessageFailed(
        MessageErrorType.AlreadyInGame,
        gameRoom.details
      );
      return true;
    }
    return false;
  }

  private invitationForNewRoomAllowed(sender: Client, data: any): boolean {
    return (
      this.clientAllowedToSendMessage(sender, data) &&
      !this.clientAlredyInRoom(sender)
    );
  }

  private createRoomForClient(client: Client, config: GameConfig,  settings: {}): GameRoomSession {
    const gameRoom = new GameRoomSession(this.id, config, settings);
    this.gameRooms = gameRoom;
    gameRoom.addInClients(client);
    this.mainSession.broadcastSession([client.id]);
    return gameRoom;
  }

  public inviteAndOpenRoom(sender: Client, data: InviteAndOpenRoom): void {
    if (!this.invitationForNewRoomAllowed(sender, data)) {
      return;
    }

    const clientsToInvite = InvitationCreation.getRecipientsForInvitation(sender, this.mainSession, data);
    if (!clientsToInvite.length) {
      return;
    }

    const { config, settings } = data;
    const gameRoom = this.createRoomForClient(sender, config, settings);

    gameRoom.broadcastRoomCreated(sender, [...clientsToInvite.map(client => client.details)]);
    InvitationsController.sendInvitations(sender, clientsToInvite, gameRoom);
  }

  public rejectInvitation(client: Client, invitationId: string): void {
    if (!this.clientAllowedToSendMessage(client, {rejectInvitation: invitationId})) {
      return;
    }
    InvitationsController.rejectInvitation(client, this.mainSession, invitationId);
  }

  public acceptInvitation(client: Client, invitationId: string): void {
    const invitation = client.geReceivedInvitation(invitationId);

    if (!invitation) {
      client.sendMessageFailed(MessageErrorType.InvitationDoesNotExist, {invitationId});
      return;
    }

    const gameRoomToJoin = this.getRoomSession(invitation.game.id);
    if (!gameRoomToJoin) {
      client.sendMessageFailed(MessageErrorType.GameDoesNotExist, invitation);
      return;
    }

    const gameRoomToLeave = this.getRoomSession(client.gameRoomId);
    gameRoomToJoin.joinGame(client);
    this.mainSession.broadcastSession([client.id]);
    this.playerLeftGame(client, gameRoomToLeave);
  }


  public quitGame(client: Client, gameId: string): void {
    console.log("player quits before invitation is accepted?");
    console.log(gameId);

    const gameRoom = this.getRoomSession(gameId);
    if (!gameRoom) {
      client.sendMessageFailed(MessageErrorType.GameDoesNotExist, {"game-to-quit": gameId});
      return;
    }
    this.playerLeftGame(client, gameRoom);
    this.mainSession.addClient(client);
  }





  public submitGameUpdate(client: Client, data: {}): void {
    const gameRoom = this.getRoomSession(client.gameRoomId);
    if (!gameRoom) {
      client.sendMessageFailed(MessageErrorType.GameDoesNotExist, data);
      return;
    }
    gameRoom.broadcastGameUpdate(client, data);
  }

  public submitGameOver(client: Client, data: {}): void {
    const gameRoom = this.getRoomSession(client.gameRoomId);
    if (!gameRoom) {
      client.sendMessageFailed(MessageErrorType.GameDoesNotExist, data);
      return;
    }
    gameRoom.gameOver(client, data);
  }

  public removeClient(client: Client): boolean {
    // TODO: terminate games
    // TODO:  handle invitations
    // console.log("removeClient From gaming host");

    if (!client) {
      //   console.log("no client to remove");
      return false;
    }

    console.log(client.userData);

    this.mainSession.removeClient(client);
    return !this.mainSession.hasClients;
  }


  private playerLeftGame(client: Client, gameRoomToLeave: GameRoomSession): void {
    if (!gameRoomToLeave) {
      return;
    }
    gameRoomToLeave.quitGame(client);
    if (!gameRoomToLeave.hasClients) {
      this.removeRoomSession(gameRoomToLeave);
    }
  }

  private rejectPendingInvitations(client: Client): void {
    // TODO: terminate games
    // TODO:  handle invitations
    // console.log("removeClient From gaming host");
    // if (!client) {
    //   //   console.log("no client to remove");
    //   return false;
    // }
    // console.log(client.userData);
    // this.mainSession.removeClient(client);
    // return !this.mainSession.hasClients;
  }
}
