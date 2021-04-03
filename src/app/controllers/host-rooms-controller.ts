import { Client } from "../client/client";
import {
  GameConfig,
  ConfigUtils,
} from "../session/game-room/game-config/game-config";
import { getValidRoomType, getValidPlayersAllowed } from "../session/game-room/game-config/game-config.utils";
import { GameRoom } from "../session/game-room/game-room";
import { GameRoomsController } from "./game-rooms-controller";

export class HostRoomsController {
  private _gameRooms: GameRoomsController = new GameRoomsController();
  // private _privateGameRooms: GameRoomsController = new GameRoomsController();
  // private messageActionConfig: Map<string, (client: Client, msg: MessageIn) => void> = new Map();

  constructor() {
    // this.messageActionConfig.set(MessageInType.GameMessage, this.onGameMessage.bind(this));
    // this.messageActionConfig.set(MessageInType.GameUpdate, this.onGameUpdate.bind(this));
    // this.messageActionConfig.set(MessageInType.GameOver, this.onGameOver.bind(this));
    // this.messageActionConfig.set(MessageInType.GameState, this.onGameState.bind(this));
    // this.messageActionConfig.set(MessageInType.GameRestartRequest, this.onGameRestartRequest.bind(this));
    // this.messageActionConfig.set(MessageInType.GameRestartReject, this.onGameRestartReject.bind(this));
    // this.messageActionConfig.set(MessageInType.GameRestartAccept, this.onGameRestartAccept.bind(this));
    // this.messageActionConfig.set(MessageInType.GameInvitationAccept, this.onGameInvitationAccept.bind(this));
  }

  private set addGameRoom(session: GameRoom) {
    this._gameRooms.addGameRoom = session;
  }

  private getGameToJoin(data: GameConfig): GameRoom {
    const config: GameConfig = ConfigUtils.getValidGameConfig(data);
    const { settings, ...gameConfig } = config;
    const gameKey = ConfigUtils.generateGameKey(gameConfig);
    let gameRoom = this._gameRooms.getAvailableGameRoomByKey(gameKey);
    if (!gameRoom) {
      gameRoom = new GameRoom(config, settings);
      this.addGameRoom = gameRoom;
    }
    return gameRoom;
  }

  public enterClientInGame(client: Client, data: GameConfig): void {
    const gameRoom = this.getGameToJoin(data);
    gameRoom.joinClient(client);
  }

  public removeClientFromCurrentGame(client: Client): void {
    console.log("removeClientFromCurrentGame");
    console.log(client.gameRoomId);

    // remove from private game
    // const gameRoom = this.getGameRoomById(client.gameRoomId);
    // if (!gameRoom) {
    //   return;
    // }
    // gameRoom.onPlayerLeft(client);
    // // if client one?
    // if (!gameRoom.hasClients) {
    //   this.deleteGameRoom(gameRoom);
    // }
  }

  // public joinOrOpenPublicRoom(configData: GameConfig, settings?: {}): GameRoomSession | PrivateGameSession {
  //   const config: GameConfig = ConfigUtils.getValidGameConfig(configData);
  //   const gameKey = ConfigUtils.generateGameKey(config);
  //   let gameRoom = this._gameRooms.getAvailableGameRoomByKey(gameKey);
  //   if (!gameRoom) {
  //     gameRoom = new GameRoomSession(config, settings);
  //     this.addGameRoom = gameRoom;
  //   }
  //   return gameRoom;
  // }



  // public set addPrivateGameRoom(session: GameRoomSession) {
  //   this._privateGameRooms.addGameRoom = session;
  // }

  // public get hasGameRooms(): boolean {
  //   return this._gameRooms.hasGameRooms || this._privateGameRooms.hasGameRooms;
  // }

  // public getGameRoomById(gameId: string): PrivateGameSession | GameRoomSession {
  //   return (
  //     this._privateGameRooms.getGameRoomById(gameId) ||
  //     this._gameRooms.getGameRoomById(gameId)
  //   );
  // }

  // public getAvailableGameRoomByKey(gameKey: string): GameRoomSession {
  //   return this._gameRooms.getAvailableGameRoomByKey(gameKey);
  // }

  // public deleteGameRoom(session: GameRoomSession | PrivateGameSession): void {
  //   if (this._privateGameRooms.gameRoomExists(session.id)) {
  //     this._privateGameRooms.deleteGameRoom(session);
  //   } else {
  //     this._gameRooms.deleteGameRoom(session);
  //   }
  // }

  // public openPrivateGameRoom(client: Client, configData: GameConfig, expectedPlayers: Client[], settings: {}): GameRoomSession | PrivateGameSession {
  //   const config: GameConfig = ConfigUtils.getValidGameConfig(configData);
  //   config.playersAllowed = expectedPlayers.length + 1;
  //   const gameRoom = new PrivateGameSession(config, settings);
  //   gameRoom.onOpen(client, expectedPlayers);
  //   this.addPrivateGameRoom = gameRoom;
  //   return gameRoom;
  // }

  // public removeClientFromCurrentGame(client: Client): void {
  //   // remove from private game
  //   const gameRoom = this.getGameRoomById(client.gameRoomId);
  //   if (!gameRoom) {
  //     return;
  //   }
  //   gameRoom.onPlayerLeft(client);
  //   // if client one?
  //   if (!gameRoom.hasClients) {
  //     this.deleteGameRoom(gameRoom);
  //   }
  // }

  // public handleMessage(client: Client, msg: MessageIn): void {
  //   if (this.messageActionConfig.get(msg.type)) {
  //     this.messageActionConfig.get(msg.type)(client, msg);
  //   } else {
  //     console.log("not implemented");
  //     console.log(msg);
  //   }
  // }

  // public clientAllowedToSendGameMessage(client: Client, msg: MessageIn): boolean {
  //   if (!client.gameRoomId) {
  //     client.sendError(MessageErrorType.ClientNotInGame, msg);
  //     return false;
  //   }
  //   return true;
  // }

  // private checkAndGetGameOnClientMessage(client: Client, msg: MessageIn,
  //   callBack: (gameRoom: GameRoomSession | PrivateGameSession) => void): void {
  //   if (!this.clientAllowedToSendGameMessage(client, msg)) {
  //     return;
  //   }
  //   this.getGameForMessage(client, client.gameRoomId, msg, callBack);
  // }

  // public getGameForMessage(client: Client, gameRoomId: string, msg: MessageIn,
  //   callBack: (gameRoom: GameRoomSession | PrivateGameSession) => void): void {
  //   const gameRoom = this.getGameRoomById(gameRoomId);
  //   if (!gameRoom) {
  //     client.sendError(MessageErrorType.GameNotFound, msg);
  //     return;
  //   }
  //   callBack(gameRoom);
  // }

  // private onGameMessage(client: Client, msg: MessageIn): void {
  //   this.checkAndGetGameOnClientMessage(client, msg, (gameRoom) => {
  //     gameRoom.broadcastGameMessage(client, msg.data);
  //   });
  // }

  // private onGameOver(client: Client, msg: MessageIn): void {
  //   this.checkAndGetGameOnClientMessage(client, msg, (gameRoom) => {
  //     gameRoom.onGameOver(client, msg.data);
  //   });
  // }

  // private onGameUpdate(client: Client, msg: MessageIn): void {
  //   this.checkAndGetGameOnClientMessage(client, msg, (gameRoom) => {
  //     gameRoom.broadcastGameUpdate(client, msg.data);
  //   });
  // }

  // private onGameState(client: Client, msg: MessageIn): void {
  //   this.checkAndGetGameOnClientMessage(client, msg, (gameRoom) => {
  //     client.notify(MessageOutType.GameState, gameRoom.state);
  //   });
  // }

  // private onGameRestartRequest(client: Client, msg: MessageIn): void {
  //   this.checkAndGetGameOnClientMessage(client, msg, (gameRoom) => {
  //     gameRoom.onRequestRestart(client);
  //   });
  // }

  // private onGameRestartReject(client: Client, msg: MessageIn): void {
  //   this.checkAndGetGameOnClientMessage(client, msg, (gameRoom) => {
  //     gameRoom.onRestartReject(client);
  //   });
  // }

  // private onGameRestartAccept(client: Client, msg: MessageIn): void {
  //   this.checkAndGetGameOnClientMessage(client, msg, (gameRoom) => {
  //     gameRoom.onRestartAccept(client);
  //   });
  // }
}
