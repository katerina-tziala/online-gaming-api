import {
  MessageErrorType,
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
  private actionsConfig: Map<string, (client: Client, msg: MessageIn) => void> = new Map();

  constructor() {
    this.actionsConfig.set("game-message", this.onGameMessage);
    this.actionsConfig.set("game-update", this.onGameUpdate);
    this.actionsConfig.set("game-over", this.onGameOver);
    this.actionsConfig.set("game-state", this.onGameState);
  }


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

  public handleMessage(client: Client, msg: MessageIn): void {
    if (this.actionsConfig.get(msg.type)) {
      this.actionsConfig.get(msg.type)(client, msg);
    } else {
      console.log("not implemented");
      console.log(msg);
    }
  }

  public clientAllowedToSendGameMessage(client: Client, msg: MessageIn): boolean {
    if (!client.gameRoomId) {
      client.sendError(MessageErrorType.ClientNotInGame, msg);
      return false;
    }
    return true;
  }

  private checkAndGetGameOnClientMessage(client: Client, msg: MessageIn,
    callBack: (gameRoom: GameRoomSession | PrivateGameRoomSession) => void): void {
    if (!this.clientAllowedToSendGameMessage(client, msg)) {
      return;
    }
    const gameRoom = this.getGameRoomById(client.gameRoomId);
    if (!gameRoom) {
      client.sendError(MessageErrorType.GameNotFound, msg);
      return;
    }
    callBack(gameRoom);
  }

  private onGameMessage(client: Client, msg: MessageIn): void {
    this.checkAndGetGameOnClientMessage(client, msg, (gameRoom) => {
      gameRoom.broadcastGameMessage(client, msg.data);
    });
  }

  private onGameOver(client: Client, msg: MessageIn): void {
    this.checkAndGetGameOnClientMessage(client, msg, (gameRoom) => {
      gameRoom.onGameOver(client, msg.data);
    });
  }

  private onGameUpdate(client: Client, msg: MessageIn): void {
    this.checkAndGetGameOnClientMessage(client, msg, (gameRoom) => {
      gameRoom.broadcastGameUpdate(client, msg.data);
    });
  }

  private onGameState(client: Client, msg: MessageIn): void {
    this.checkAndGetGameOnClientMessage(client, msg, (gameRoom) => {
      client.notify(MessageOutType.GameState, gameRoom.state);
    });
  }
}
