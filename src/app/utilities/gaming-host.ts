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
import { MessageErrorType, MessageInType, MessageOutType } from "../messages/message-types.enum";
import { PrivateMessage } from "../interfaces/private-message.interface";
import { GameConfig } from "../interfaces/game-room.interfaces";
// import { InvitationsController } from "../invitations/invitations-controller";

export class GamingHost extends MainSession {
  public id: string;
  private _GameRooms: Map<string, GameRoomSession> = new Map();

  constructor(id: string) {
    super();
    this.id = id;
  }

  private set gameRooms(session: GameRoomSession) {
    this._GameRooms.set(session.id, session);
  }

  private removeRoomSession(session: GameRoomSession): void {
    this._GameRooms.delete(session.id);
  }

  private getRoomSession(roomId: string): GameRoomSession {
    return this._GameRooms.get(roomId);
  }

  public onMessage(client: Client, msg: MessageIn): void {
    if (!this.clientExists(client)) {
      client.sendError(MessageErrorType.NotJoined, msg);
      return;
    }

    switch (msg.type) {
      case MessageInType.UserUpdate:
        this.onClientUpdate(client, msg);
        break;
      case MessageInType.PrivateMessage:
        this.sendPrivateMessage(client, msg);
        break;
      case MessageInType.OpenPrivateGameRoom:
        this.onOpenPrivateGameRoom(client, msg);
        break;
      default:
        console.log("message");
        console.log("-------------------------");
        console.log(msg);
        console.log(client.info);
        break;
    }
  }

  private onOpenPrivateGameRoom(client: Client, msg: MessageIn): void {
    const config: GameConfig = msg.data;
    // config.playersExpected = this.getUniqueExpectedPlayers(client, config);

    // if (!config.playersExpected.length) {
    //   client.sendError(MessageErrorType.ExpectedPlayersNotSpecified, msg);
    //   return;
    // }

    // const { potentialPlayers, errorType } = this.checkPotentialPlayers(config.playersExpected);
    // if (errorType) {
    //   client.sendError(errorType, msg);
    //   return;
    // }
    // this.openPrivateGameRoom(client, config, potentialPlayers);
    this.openPrivateGameRoom(client, config, this.clients);
  }

  private getUniqueExpectedPlayers(client: Client, config: GameConfig): string[] {
    const playersExpected = config.playersExpected || [];
    let uniqueIds = Array.from(new Set(playersExpected));
    uniqueIds = uniqueIds.filter(clientId => clientId !== client.id);
    return uniqueIds;
  }

  private checkPotentialPlayers(playersExpected: string[] = []): { potentialPlayers: Client[]; errorType: MessageErrorType; } {
    const potentialPlayers: Client[] = this.getClientsByIds(playersExpected);
    let errorType;
    if (!potentialPlayers.length) {
      errorType = MessageErrorType.ExpectedPlayersNotConnected;
    } else if (potentialPlayers.length !== playersExpected.length) {
      errorType = MessageErrorType.SomeExpectedPlayersNotConnected;
    }
    return { potentialPlayers, errorType };
  }


  private openPrivateGameRoom(client: Client, gameConfig: GameConfig, potentialPlayers: Client[]): void {

    console.log(client.info);
    console.log(gameConfig);





  }














  public disconnectClient(client: Client): void {
    console.log("disconnectClient");
    console.log("invitations");
    if (!client) {
      return;
    }

   const gameRoom = this.getRoomSession(client.gameRoomId);
    if (gameRoom) {
      console.log("client leaves game");

    }
    this.removeClient(client);
  }

}
