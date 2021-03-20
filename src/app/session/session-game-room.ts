// import { UserInfo } from "../interfaces/user-data.interface";
// import { MessageOutType } from "../messages/message-types.enum";
// import { getRandomValueFromArray } from "../utilities/app-utils";
import { Client } from "../utilities/client";
import { Session } from "./session";
import { GameConfig } from "../interfaces/game-room.interfaces";

export class GameRoomSession extends Session {
  // public roomType: string;
  // public url: string;
  // private allowedPlayers: number = 2;
  // private origin: string;
  // private _settings: {} = {};
  // private startTimeout: ReturnType<typeof setTimeout>;
  // private playerStartId: string;
  // private startedAt: string;
  // private endedAt: string;
  // private startWaitingTime: number;

  constructor(config: GameConfig, settings?: {}) {
    super();
    console.log("GameRoomSession");
    console.log(config);
    console.log(settings);

    // this.origin = origin;
    // this.url = `${this.origin}?gameId=${this.id}`;
    // this.allowedPlayers = config.allowedPlayers || 2;
    // this.roomType = config.roomType || "default";
    // this.startWaitingTime = config.startWaitingTime || 3000;
    // this.settings = settings;
  }

  // // TODO: message to restart
  // public set settings(settings: {}) {
  //   this._settings = settings;
  // }

  // public get settings(): {} {
  //   return this._settings;
  // }

  // public get config(): GameConfig {
  //   return {
  //     roomType: this.roomType,
  //     allowedPlayers: this.allowedPlayers,
  //     startWaitingTime: this.startWaitingTime,
  //   };
  // }

  // public get allowPlayerEntrance(): boolean {
  //   return !this.roomClosed && !this.startedAt && !this.endedAt;
  // }

  // public get roomClosed(): boolean {
  //   return this.clientsList.length === this.allowedPlayers;
  // }

  // public get completionDuration(): Duration {
  //   return getDurationFromDates(
  //     new Date(this.startedAt),
  //     new Date(this.endedAt)
  //   );
  // }

  // public get info(): GameInfo {
  //   return {
  //     id: this.id,
  //     url: this.url,
  //     config: this.config,
  //     roomClosed: this.roomClosed,
  //     createdAt: this.createdAt,
  //   };
  // }

  // public get details(): GameInfo {
  //   return {
  //     ...this.info,
  //     startedAt: this.startedAt,
  //     endedAt: this.endedAt,
  //     players: this.clientsList.map((client) => client.details),
  //     playerStartId: this.playerStartId,
  //     settings: this.settings,
  //   };
  // }

  // public joinGame(client: Client): void {
  //   if (!this.allowPlayerEntrance) {
  //     client.notify(MessageOutType.GameEntranceForbidden, this.info);
  //     return;
  //   }

  //   this.addInClients(client);
  //   this.broadcastRoomOpened(client);

  //   if (this.roomClosed) {
  //     this.checkGameStart();
  //   }
  // }

  // public quitGame(client: Client): void {
  //   clearTimeout(this.startTimeout);
  //   this.broadcastPlayerLeft(client);
  //   this.removeFromClients(client);
  // }

  // private checkGameStart(): void {
  //   clearTimeout(this.startTimeout);
  //   this.startTimeout = setTimeout(
  //     () => {
  //       this.startGame();
  //     },
  //     this.startWaitingTime);
  // }

  // private startGame(): void {
  //   if (this.roomClosed && !this.endedAt) {
  //     const playersIds = this.clientsList.map((client) => client.id);
  //     this.playerStartId = getRandomValueFromArray(playersIds);
  //     this.startedAt = new Date().toString();
  //     this.broadcastGameStart();
  //   }
  //    clearTimeout(this.startTimeout);
  // }

  // private getGameStateBroadcastData(initiator: Client, data?: {}): GameMessage {
  //   return {
  //     sender: initiator.details,
  //     game: this.details,
  //     data,
  //   };
  // }

  // private endGame(): void {
  //   clearTimeout(this.startTimeout);
  //   this.endedAt = new Date().toString();
  // }

  // public addInClients(client: Client): void {
  //   client.gameRoomId = this.id;
  //   super.addInClients(client);
  //   this.broadcastPlayerEntrance(client);
  // }

  // public broadcastGameUpdate(player: Client, updateData: {}): void {
  //   if (!this.endedAt) {
  //     const data = this.getGameStateBroadcastData(player, updateData);
  //     this.broadcastToPeers(player, MessageOutType.GameUpdate, data);
  //   }
  // }

  // public gameOver(player: Client, updateData: {}): void {
  //   this.endGame();
  //   this.broadcastGameOver(player, updateData);
  // }

  // public broadcastRoomCreated(client: Client, clientsInvited: UserInfo[]): void {
  //   const data = {
  //     sender: client.details,
  //     game: this.details,
  //     clientsInvited,
  //   };
  //   client.notify(MessageOutType.RoomCreated, data);
  // }

  // private broadcastToPeers(initiator: Client, type: MessageOutType, data: GameMessage): void {
  //   const peers = this.getClientPeers(initiator);
  //   peers.forEach((client) => client.notify(type, data));
  // }

  // private broadcastPlayerEntrance(playerJoined: Client): void {
  //   const data = this.getGameStateBroadcastData(playerJoined);
  //   this.broadcastToPeers(playerJoined, MessageOutType.PlayerJoined, data);
  // }

  // private broadcastGameStart(): void {
  //   this.clientsList.forEach((client) =>
  //     client.notify(MessageOutType.GameStart, this.details)
  //   );
  // }

  // private broadcastGameOver(player: Client, updateData: {}): void {
  //   const game = this.details;
  //   game.durationCompleted = this.completionDuration;
  //   const data = {
  //     sender: player.details,
  //     game,
  //     data: updateData,
  //   };
  //   this.clientsList.forEach((client) =>
  //     client.notify(MessageOutType.GameOver, data)
  //   );
  // }

  // private broadcastRoomOpened(client: Client): void {
  //   const data = {
  //     user: client.details,
  //     game: this.details,
  //   };
  //   client.notify(MessageOutType.RoomOpened, data);
  // }

  // private broadcastPlayerLeft(playerLeft: Client): void {
  //   const data = this.getGameStateBroadcastData(playerLeft);
  //   this.broadcastToPeers(playerLeft, MessageOutType.PlayerLeft, data);
  // }

}
