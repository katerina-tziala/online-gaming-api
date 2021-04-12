import { Client } from "../client/client";
import { MessageInType } from "../messages/message-types/message-in-type.enum";
import { MessageIn } from "../messages/message.interface";
import {
  GameConfig,
  ConfigUtils,
} from "../game/game-config/game-config";
import { GameRoom } from "../session/game-room/game-room";
import { GameRoomPrivate } from "../session/game-room/game-room-private";
import { GameRoomsController } from "./game-rooms-controller";
import { ReportInfo } from "../report-info.interface";

export class HostRoomsController {
  private _gameRooms: GameRoomsController<GameRoom> = new GameRoomsController();
  private _privateGameRooms: GameRoomsController<GameRoomPrivate> = new GameRoomsController();

  public get info(): ReportInfo {
    const privateGameRooms = this._privateGameRooms.gameRooms.map(room => room.info);
    const gameRooms = this._gameRooms.gameRooms.map(room => room.info);
    return { privateGameRooms, gameRooms };
  }

  private set addGameRoom(session: GameRoom) {
    this._gameRooms.addGameRoom = session;
  }

  private set addPrivateGameRoom(session: GameRoomPrivate) {
    this._privateGameRooms.addGameRoom = session;
  }

  public get hasGameRooms(): boolean {
    return this._gameRooms.hasGameRooms || this._privateGameRooms.hasGameRooms;
  }

  public deleteGameRoom(session: GameRoom | GameRoomPrivate): void {
    if (this._privateGameRooms.gameRoomExists(session.id)) {
      this._privateGameRooms.deleteGameRoom(session);
    } else {
      this._gameRooms.deleteGameRoom(session);
    }
  }

  public getAvailableGameRoomByKey(gameKey: string): GameRoom {
    return this._gameRooms.getAvailableGameRoomByKey(gameKey);
  }

  public getPrivateGameRoomById(gameId: string): GameRoomPrivate {
    return this._privateGameRooms.getGameRoomById(gameId);
  }

  public getGameRoomById(gameId: string): GameRoomPrivate | GameRoom {
    return (
      this._privateGameRooms.getGameRoomById(gameId) ||
      this._gameRooms.getGameRoomById(gameId)
    );
  }

  private getGameToJoin(data: GameConfig): GameRoom {
    const config: GameConfig = ConfigUtils.getValidGameConfig(data);
    const gameKey = ConfigUtils.generateGameKey(config);
    let gameRoom = this.getAvailableGameRoomByKey(gameKey);
    if (!gameRoom) {
      gameRoom = this.createNewGame(data);
    }
    return gameRoom;
  }

  private createNewGame(data: GameConfig): GameRoom {
    const config: GameConfig = ConfigUtils.getValidGameConfig(data);
    const gameRoom = new GameRoom(config);
    this.addGameRoom = gameRoom;
    return gameRoom;
  }

  public enterClientInGame(client: Client, data: GameConfig): void {
    this.removeClientFromCurrentGame(client);
    const gameRoom = this.getGameToJoin(data);
    gameRoom.joinClient(client);
  }

  public enterClientInNewGame(client: Client, data: GameConfig): void {
    this.removeClientFromCurrentGame(client);
    const gameRoom = this.createNewGame(data);
    gameRoom.joinClient(client);
  }

  public removeClientFromCurrentGame(client: Client): void {
    const gameRoom = this.getGameRoomById(client.gameId);
    if (!gameRoom) {
      return;
    }
    gameRoom.onPlayerLeft(client);
    if (!gameRoom.hasClients) {
      this.deleteGameRoom(gameRoom);
    }
  }

  public onGameBasedMessage(client: Client, message: MessageIn): void {
    const { type } = message;

    if (!client.allowedToSendGameMessage(type)) {
      return;
    }

    const gameRoom = this.getGameRoomById(client.gameId);
    if (!gameRoom) {
      client.sendGameNotFound(client.gameId, type);
      return;
    }

    gameRoom.onMessage(client, message);
  }

  public onRejectGameInvitation(client: Client, gameId: string): void {
    const gameRoom = this.getPrivateGameRoomById(gameId);
    if (!gameRoom) {
      client.sendGameNotFound(client.gameId, MessageInType.GameInvitationReject);
      return;
    }
    gameRoom.onRejectInvitation(client);
  }

  public onAcceptGameInvitation(client: Client, gameId: string, callBack: () => void): void {
    const gameRoom = this.getPrivateGameRoomById(gameId);
    if (!gameRoom) {
      client.sendGameNotFound(client.gameId, MessageInType.GameInvitationAccept);
    } else if (gameRoom.joinClient(client)) {
      callBack();
    }
  }

  public openPrivateGameRoom(client: Client, configData: GameConfig, expectedPlayers: Client[]): void {
    this.removeClientFromCurrentGame(client);
    const config: GameConfig = ConfigUtils.getValidGameConfig(configData);
    config.playersRequired = expectedPlayers.length + 1;
    this.addPrivateGameRoom = new GameRoomPrivate(config, client, expectedPlayers);
  }

  public rejectGameInvitationsForDisconnectedClient(client: Client): void {
    const gameRoomsPending = this._privateGameRooms.gameRooms.filter(gameRoom => gameRoom.clientPendingInvitation(client.id));
    gameRoomsPending.forEach(gameRoom => {
      gameRoom.onRejectInvitation(client);
    });
  }
}
