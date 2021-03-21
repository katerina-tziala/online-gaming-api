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
import {
  MessageErrorType,
  MessageInType,
  MessageOutType,
} from "../messages/message-types.enum";
import { PrivateMessage } from "../interfaces/private-message.interface";
import { GameConfig } from "../interfaces/game-room.interfaces";
import { TYPOGRAPHY } from "./constants/typography.constants";
// import { InvitationsController } from "../invitations/invitations-controller";

export class GamingHost extends MainSession {
  public id: string;
  private _GameRooms: Map<string, GameRoomSession> = new Map();

  constructor(id: string) {
    super();
    this.id = id;
  }

  private set addGameRoom(session: GameRoomSession) {
    this._GameRooms.set(session.id, session);
  }

  public get hasGameRooms(): boolean {
    return !!this._GameRooms.size;
  }

  public get gameRooms(): GameRoomSession[] {
    return Array.from(this._GameRooms.values());
  }

  private getGameRoomById(roomId: string): GameRoomSession {
    return this._GameRooms.get(roomId);
  }
  public getAvailableGameRoomByKey(gameKey: string): GameRoomSession {
    return this.gameRooms.find(
      (room) => room.entranceAllowed && room.key === gameKey
    );
  }

  // private removeRoomSession(session: GameRoomSession): void {
  //   this._GameRooms.delete(session.id);
  // }



  public onJoinClient(client: Client, msg: MessageIn): void {
    const { gameRoomId } = msg.data;
    this.joinClient(client, msg);

    if (gameRoomId) {
      this.joinClientInGame(client, gameRoomId);
    }
  }


  public joinClientInGame(client: Client, gameRoomId: string): void {
    const gameRoom = this.getGameRoomById(gameRoomId);
    if (!gameRoom) {
      client.sendError(MessageErrorType.GameNotFound, { gameRoomId });
      return;
    }
    this.addClientInGameRoom(client, gameRoom);
  }

  private addClientInGameRoom(client: Client, gameRoom: GameRoomSession): void {
    gameRoom.joinClient(client);
    if (gameRoom.clientExists(client)) {
      this.broadcastPeersUpdate(client);
    }
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
      case MessageInType.OpenGameRoom:
        this.onOpenGameRoom(client, msg);
        break;
      default:
        console.log("message");
        console.log("-------------------------");
        console.log(msg);
        console.log(client.info);
        break;
    }
  }

  private getValidGameConfig(config: GameConfig): GameConfig {
    config.playersAllowed = config.playersAllowed || 2;
    config.roomType = config.roomType || "default";
    config.startWaitingTime = config.startWaitingTime || 3000;
    return config;
  }
  // gamroom namespace/module
  private getGameKey(config: GameConfig): string {
    return `${config.roomType}${TYPOGRAPHY.HYPHEN}${config.playersAllowed}${TYPOGRAPHY.HYPHEN}${config.startWaitingTime}`;
  }

  private onOpenGameRoom(client: Client, msg: MessageIn): void {
    const { settings, ...configData } = msg.data;
    const config: GameConfig = this.getValidGameConfig(configData);
    const gameKey = this.getGameKey(config);

    let gameRoom = this.getAvailableGameRoomByKey(gameKey);
    if (!gameRoom) {
      gameRoom = new GameRoomSession(config, settings);
      this.addGameRoom = gameRoom;
    }
    this.addClientInGameRoom(client, gameRoom);
  }

  private onOpenPrivateGameRoom(client: Client, msg: MessageIn): void {
    const config: GameConfig = msg.data;
    // config.playersExpected = this.getExpectedOpponents(client, msg.data.playersExpected);

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
    this.openPrivateGameRoom(client, config, this.getClientPeers(client));
  }

  private getExpectedOpponents(
    client: Client,
    playersExpected: string[] = []
  ): string[] {
    let expectedOpponents = Array.from(new Set(playersExpected));
    expectedOpponents = expectedOpponents.filter(
      (clientId) => clientId !== client.id
    );
    return expectedOpponents;
  }

  private checkPotentialPlayers(
    playersExpected: string[] = []
  ): { potentialPlayers: Client[]; errorType: MessageErrorType } {
    const potentialPlayers: Client[] = this.getClientsByIds(playersExpected);
    let errorType;
    if (!potentialPlayers.length) {
      errorType = MessageErrorType.ExpectedPlayersNotConnected;
    } else if (potentialPlayers.length !== playersExpected.length) {
      errorType = MessageErrorType.SomeExpectedPlayersNotConnected;
    }
    return { potentialPlayers, errorType };
  }

  private openPrivateGameRoom(
    client: Client,
    config: GameConfig,
    potentialPlayers: Client[]
  ): void {
    console.log(client.info);
    console.log(config);

    // const report = this.clients.map(client => client.info);
    // console.log(report);
  }

  public disconnectClient(client: Client): void {
    console.log("disconnectClient");
    console.log("invitations");
    if (!client) {
      return;
    }

    const gameRoom = this.getGameRoomById(client.gameRoomId);
    if (gameRoom) {
      console.log("client leaves game");
    }
    this.removeClient(client);
  }
}
