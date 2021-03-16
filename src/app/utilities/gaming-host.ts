// import { GameConfig, InviteAndOpenRoom } from "../interfaces/game-room.interfaces";
// import { UserData } from "../interfaces/user-data.interface";
// import { InvitationCreation } from "../invitations/invitation-creation";
// import {
//   MessageErrorType,
//   MessageOutType,
// } from "../messages/message-types.enum";
// import { MessageOut } from "../messages/message.interface";
import { Session } from "../session/session";
import { ClientUpdateData } from "../interfaces/user-data.interface";
import { GameRoomSession } from "../session/session-game-room";
import { MainSession } from "../session/session-main";
import { Client } from "./client";
import { MessageIn } from "../messages/message.interface";
import { MessageErrorType, MessageOutType } from "../messages/message-types.enum";
// import { InvitationsController } from "../invitations/invitations-controller";

export class GamingHost extends MainSession {
  public id: string;
  private _GameRooms: Map<string, GameRoomSession> = new Map();

  constructor(id: string) {
    super();
    this.id = id;
  }




  private usernameValidationError(client: Client, username: string): MessageErrorType {
    if (!username || !username.length) {
      return MessageErrorType.UsernameRequired;
    }

    const usernameValid = new RegExp(/^\w{4,}$/).test(username);
    if (!usernameValid) {
      return MessageErrorType.UsernameInvalid;
    }

    const usernamesInSession = this.getClientPeers(client).map(peer => peer.username);
    if (usernamesInSession.includes(username)) {
      return MessageErrorType.UsernameInUse;
   }

   return;
  }

  public joinClient(client: Client, msg: MessageIn): void {
    const { username } = msg.data;
    const validationError = this.usernameValidationError(client, username);
    if (validationError) {
      client.sendError(validationError, msg);
      return;
    }
    client.update(msg.data);
    this.addClient(client);
  }

  public updateClient(client: Client, msg: MessageIn): void {
    const { username } = msg.data;
    const validationError = this.usernameValidationError(client, username);

    if (username && validationError) {
      client.sendError(validationError, msg);
      return;
    }
    client.update(msg.data);
    this.broadcastUpdatedClient(client);
  }

  public sendPrivateMessage(client: Client, msg: MessageIn): void {
    console.log(client.info);
    console.log(msg.data);

    // if (!this.clientAllowedToSendMessage(sender, data)) {
    //   return;
    // }

    // const recipient = this.mainSession.getClientById(data.recipientId);
    // if (!recipient) {
    //   sender.sendRecipientNotConnected(data);
    //   return;
    // }

    // if (sender.id === recipient.id) {
    //   console.log("cannot send message to self");
    //   return;
    // }

    // recipient.sendPrivateMessage(sender.details, data.message);
  }





  // set gameRooms(session: GameRoomSession) {
  //   this._GameRooms.set(session.id, session);
  // }

  // public getRoomSession(roomId: string): GameRoomSession {
  //   return this._GameRooms.get(roomId);
  // }

  // public removeRoomSession(session: GameRoomSession): void {
  //   this._GameRooms.delete(session.id);
  // }

  // private clientJoined(client: Client): boolean {
  //   if (!this._MainSession) {
  //     return false;
  //   }
  //   return this._MainSession.clientExists(client);
  // }

  // public joinClient(client: Client, data: UserData): void {
  //   this.mainSession.joinClient(client, data);
  // }



  // public sendPrivateMessage(sender: Client, data: any): void {
  //   if (!this.clientAllowedToSendMessage(sender, data)) {
  //     return;
  //   }

  //   const recipient = this.mainSession.getClientById(data.recipientId);
  //   if (!recipient) {
  //     sender.sendRecipientNotConnected(data);
  //     return;
  //   }

  //   if (sender.id === recipient.id) {
  //     console.log("cannot send message to self");
  //     return;
  //   }

  //   recipient.sendPrivateMessage(sender.details, data.message);
  // }

  // private clientAllowedToSendMessage(sender: Client, data: any): boolean {
  //   if (!this.clientJoined(sender)) {
  //     sender.sendUsernameRequired(data);
  //     return false;
  //   }
  //   return true;
  // }

  // private clientAlredyInRoom(sender: Client): boolean {
  //   const gameRoom = this.getRoomSession(sender.gameRoomId);
  //   if (gameRoom) {
  //     sender.sendMessageFailed(
  //       MessageErrorType.AlreadyInGame,
  //       gameRoom.details
  //     );
  //     return true;
  //   }
  //   return false;
  // }

  // private invitationForNewRoomAllowed(sender: Client, data: any): boolean {
  //   return (
  //     this.clientAllowedToSendMessage(sender, data) &&
  //     !this.clientAlredyInRoom(sender)
  //   );
  // }

  // private createRoomForClient(client: Client, config: GameConfig,  settings: {}): GameRoomSession {
  //   const gameRoom = new GameRoomSession(this.id, config, settings);
  //   this.gameRooms = gameRoom;
  //   gameRoom.addInClients(client);
  //   this.mainSession.broadcastSession([client.id]);
  //   return gameRoom;
  // }

  // public inviteAndOpenRoom(sender: Client, data: InviteAndOpenRoom): void {
  //   if (!this.invitationForNewRoomAllowed(sender, data)) {
  //     return;
  //   }

  //   const clientsToInvite = InvitationCreation.getRecipientsForInvitation(sender, this.mainSession, data);
  //   if (!clientsToInvite.length) {
  //     return;
  //   }

  //   const { config, settings } = data;
  //   const gameRoom = this.createRoomForClient(sender, config, settings);

  //   gameRoom.broadcastRoomCreated(sender, [...clientsToInvite.map(client => client.details)]);
  //   InvitationsController.sendInvitations(sender, clientsToInvite, gameRoom);
  // }

  // public rejectInvitation(client: Client, invitationId: string): void {
  //   if (!this.clientAllowedToSendMessage(client, {rejectInvitation: invitationId})) {
  //     return;
  //   }
  //   InvitationsController.rejectInvitation(client, this.mainSession, invitationId);
  // }

  // public acceptInvitation(client: Client, invitationId: string): void {
  //   const invitation = client.getInvitation(invitationId);

  //   if (!invitation) {
  //     client.sendMessageFailed(MessageErrorType.InvitationDoesNotExist, {invitationId});
  //     return;
  //   }
  //   client.acceptInvitation(invitation);
  //   // notify other recipients?
  //   const gameRoomToJoin = this.getRoomSession(invitation.game.id);
  //   if (!gameRoomToJoin) {
  //     client.sendMessageFailed(MessageErrorType.GameDoesNotExist, invitation);
  //     return;
  //   }

  //   const gameRoomToLeave = this.getRoomSession(client.gameRoomId);

  //   gameRoomToJoin.joinGame(client);
  //   this.mainSession.broadcastSession([client.id]);
  //   this.playerLeftGame(client, gameRoomToLeave);
  // }
  // public quitGame(client: Client, gameId: string): void {
  //   const gameRoom = this.getRoomSession(gameId);
  //   if (!gameRoom) {
  //     client.sendMessageFailed(MessageErrorType.GameDoesNotExist, {"game-to-quit": gameId});
  //     return;
  //   }
  //   InvitationsController.cancelInvitationsForGame(client, this.mainSession, gameRoom.id);
  //   this.playerLeftGame(client, gameRoom);
  //   this.mainSession.addClient(client);
  // }
  // public submitGameUpdate(client: Client, data: {}): void {
  //   const gameRoom = this.getRoomSession(client.gameRoomId);
  //   if (!gameRoom) {
  //     client.sendMessageFailed(MessageErrorType.GameDoesNotExist, data);
  //     return;
  //   }
  //   gameRoom.broadcastGameUpdate(client, data);
  // }

  // public submitGameOver(client: Client, data: {}): void {
  //   const gameRoom = this.getRoomSession(client.gameRoomId);
  //   if (!gameRoom) {
  //     client.sendMessageFailed(MessageErrorType.GameDoesNotExist, data);
  //     return;
  //   }
  //   gameRoom.gameOver(client, data);
  // }

  // private playerLeftGame(client: Client, gameRoomToLeave: GameRoomSession): void {
  //   if (!gameRoomToLeave) {
  //     return;
  //   }
  //   gameRoomToLeave.quitGame(client);
  //   if (!gameRoomToLeave.hasClients) {
  //     this.removeRoomSession(gameRoomToLeave);
  //   }
  // }

  // public removeClient(client: Client): void {
  //   if (!client) {
  //     return ;
  //   }
  //   const gameRoom = this.getRoomSession(client.gameRoomId);
  //   this.playerLeftGame(client, gameRoom);
  //   InvitationsController.handleInvitationsForDisconnectedClient(client, this.mainSession);
  //   this.mainSession.removeClient(client);
  // }

  // public hasClients(): boolean {
  //   if (!this.mainSession) {
  //     return true;
  //   }
  //   return !this.mainSession.hasClients;
  // }
}
