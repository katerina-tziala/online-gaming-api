import { Client } from "../client/client";
import { MessageIn } from "../messages/message.interface";
import {
  GameConfig,
  ConfigUtils,
} from "../session/game-room/game-config/game-config";

import { GameRoom } from "../session/game-room/game-room";
import { GameRoomPrivate } from "../session/game-room/game-room-private";
import { GameRoomsController } from "./game-rooms-controller";

export class HostRoomsController {
  private _gameRooms: GameRoomsController = new GameRoomsController();
  private _privateGameRooms: GameRoomsController = new GameRoomsController();
  // private messageActionConfig: Map<string, (client: Client, msg: MessageIn) => void> = new Map();

  constructor() {
    // this.messageActionConfig.set(MessageInType.GameRestartRequest, this.onGameRestartRequest.bind(this));
    // this.messageActionConfig.set(MessageInType.GameRestartReject, this.onGameRestartReject.bind(this));
    // this.messageActionConfig.set(MessageInType.GameRestartAccept, this.onGameRestartAccept.bind(this));
    // this.messageActionConfig.set(MessageInType.GameInvitationAccept, this.onGameInvitationAccept.bind(this));
  }

  private set addGameRoom(session: GameRoom) {
    this._gameRooms.addGameRoom = session;
  }

  public set addPrivateGameRoom(session: GameRoomPrivate) {
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
    const gameRoom = this.getGameRoomById(client.gameRoomId);
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

    const gameRoom = this.getGameRoomById(client.gameRoomId);
    if (!gameRoom) {
      client.sendGameNotFound(client.gameRoomId, type);
      return;
    }

    gameRoom.onMessage(client, message);
  }

  public openPrivateGameRoom(client: Client, configData: GameConfig, expectedPlayers: Client[]): void {
    this.removeClientFromCurrentGame(client);
    const config: GameConfig = ConfigUtils.getValidGameConfig(configData);
    config.playersRequired = expectedPlayers.length + 1;
    const gameRoom = new GameRoomPrivate(config, client, expectedPlayers);



    //
    // gameRoom.onOpen(client, expectedPlayers);
    // this.addPrivateGameRoom = gameRoom;
    // return gameRoom;



  }
}
