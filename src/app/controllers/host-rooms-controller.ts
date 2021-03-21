import {
  MessageErrorType,
  MessageInType,
  MessageOutType,
} from "../messages/message-types.enum";
import { MessageIn } from "../messages/message.interface";
import {
  ConfigUtils,
  GameConfig,
} from "../session/game-room/game-config/game-config";
import { GameRoomSession } from "../session/game-room/game-room-session";
import { PrivateGameRoomSession } from "../session/game-room/private-game-room-session";
import { Client } from "../utilities/client";
import { GameRoomsController } from "./game-rooms-controller";

export class HostRoomsController {
  private _gameRooms: GameRoomsController = new GameRoomsController();
  private _privateGameRooms: GameRoomsController = new GameRoomsController();

  public set addGameRoom(session: GameRoomSession) {
    this._gameRooms.addGameRoom = session;
  }

  public set addPrivateGameRoom(session: GameRoomSession) {
    this._privateGameRooms.addGameRoom = session;
  }

  public get hasGameRooms(): boolean {
    return this._gameRooms.hasGameRooms || this._privateGameRooms.hasGameRooms;
  }

  public getGameRoomById(gameId: string): PrivateGameRoomSession | GameRoomSession {
    return (
      this._privateGameRooms.getGameRoomById(gameId) ||
      this._gameRooms.getGameRoomById(gameId)
    );
  }

  public getAvailableGameRoomByKey(gameKey: string): PrivateGameRoomSession | GameRoomSession {
    return (
      this._privateGameRooms.getAvailableGameRoomByKey(gameKey) ||
      this._gameRooms.getAvailableGameRoomByKey(gameKey)
    );
  }

  public deleteGameRoom(session: GameRoomSession | PrivateGameRoomSession): void {
    if (this._privateGameRooms.gameRoomExists(session.id)) {
      this._privateGameRooms.deleteGameRoom(session);
    } else {
      this._gameRooms.deleteGameRoom(session);
    }
  }

  public joinOrOpenPublicRoom(configData: GameConfig, settings?: {}): GameRoomSession {
    const config: GameConfig = ConfigUtils.getValidGameConfig(configData);
    const gameKey = ConfigUtils.generateGameKey(config);
    let gameRoom = this._gameRooms.getAvailableGameRoomByKey(gameKey);
    if (!gameRoom) {
      gameRoom = new GameRoomSession(config, settings);
      this.addGameRoom = gameRoom;
    }
    return gameRoom;
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


  public onGameMessage(client: Client, msg: MessageIn): void {
    const gameRoom = this.getGameRoomById(client.gameRoomId);
    if (!gameRoom) {
      client.sendError(MessageErrorType.GameNotFound, msg);
      return;
    }
    switch (msg.type) {
      case MessageInType.GameUpdate:
        gameRoom.broadcastGameUpdate(client, msg.data);
        break;
      case MessageInType.GameOver:
        gameRoom.onGameOver(client, msg.data);
        break;
      case MessageInType.GameMessage:
        gameRoom.broadcastGameMessage(client, msg.data);
        break;
      case MessageInType.GameState:
        client.notify(MessageOutType.GameState, gameRoom.state);
        break;
    }
  }

}
