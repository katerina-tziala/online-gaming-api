import { Client } from "../utilities/client";
import { Session } from "./session";
import { GameInfo } from "../interfaces/game-room.interfaces";
import { MessageOutType } from "../messages/message-types.enum";
import { GameConfig, ConfigUtils } from "../session/game-room/game-config";
import {
  getDurationFromDates,
  getRandomValueFromArray,
} from "../utilities/app-utils";
import { Duration } from "../interfaces/duration.interface";

export class GameRoomSession extends Session {
  private startTimeout: ReturnType<typeof setTimeout>;
  private _config: GameConfig;
  private _settings: {} = {};
  public key: string;
  private startedAt: string;
  private endedAt: string;
  private playerStartId: string;

  constructor(config: GameConfig, settings?: {}) {
    super();
    this._config = ConfigUtils.getValidGameConfig(config);
    this.key = ConfigUtils.generateGameKey(config);
    this._settings = settings;
  }

  public get config(): GameConfig {
    return this._config;
  }

  public get settings(): {} {
    return this._settings;
  }

  public get filled(): boolean {
    return this.clients.length === this._config.playersAllowed;
  }

  public get entranceAllowed(): boolean {
    return !this.filled && !this.startedAt && !this.endedAt;
  }

  public get readyToStart(): boolean {
    return this.filled && !this.startedAt && !this.endedAt;
  }

  public get info(): GameInfo {
    return {
      id: this.id,
      createdAt: this.createdAt,
      entranceAllowed: this.entranceAllowed,
      roomType: this._config.roomType,
      playersAllowed: this._config.playersAllowed,
      startWaitingTime: this._config.startWaitingTime,
    };
  }

  public get details(): GameInfo {
    return {
      ...this.info,
      settings: this.settings,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      players: this.clients.map((client) => client.info),
      playerStartId: this.playerStartId,
    };
  }

  public get state(): GameInfo {
    return {
      ...this.details,
      completedIn: this.completedIn
    };
  }

  public get completedIn(): Duration {
    const start = this.startedAt ? new Date(this.startedAt): undefined;
    const end = this.endedAt ? new Date(this.endedAt): undefined;
    return getDurationFromDates(start, end);
  }

  public joinClient(client: Client): void {
    if (!this.entranceAllowed) {
      client.sendGameEntranceForbidden(this.info);
      return;
    }
    this.addClient(client);
  }

  public addInClients(client: Client): void {
    client.gameRoomId = this.id;
    super.addInClients(client);
  }

  public addClient(client: Client): void {
    this.addInClients(client);
    this.broadcastRoomOpened(client);
    this.broadcastPlayerEntrance(client);
    this.checkGameStart();
  }

  private broadcastRoomOpened(client: Client): void {
    const data = {
      user: client.info,
      game: this.details,
    };
    client.notify(MessageOutType.GameRoomOpened, data);
  }

  private broadcastPlayerEntrance(clientJoined: Client): void {
    const playerJoined = clientJoined.info;
    this.broadcastToPeers(clientJoined, MessageOutType.PlayerJoined, {
      playerJoined,
    });
  }

  private broadcastToPeers(initiator: Client, type: MessageOutType,  data: {}): void {
    const peers = this.getClientPeers(initiator);
    peers.forEach((client) => client.notify(type, data));
  }

  private checkGameStart(): void {
    clearTimeout(this.startTimeout);
    if (this.readyToStart) {
      this.startTimeout = setTimeout(() => {
        this.startGame();
      }, this._config.startWaitingTime);
    }
  }

  private startGame(): void {
    if (this.readyToStart) {
      const playersIds = this.clients.map((client) => client.id);
      this.playerStartId = getRandomValueFromArray(playersIds);
      this.startedAt = new Date().toString();
      this.broadcastGameStart();
    }
    clearTimeout(this.startTimeout);
  }

  private broadcastGameStart(): void {
    this.clients.forEach((client) =>
      client.notify(MessageOutType.GameStart, this.details)
    );
  }

  public broadcastGameUpdate(player: Client, data: {}): void {
    if (!this.endedAt) {
      const sender = player.info;
      this.broadcastToPeers(player, MessageOutType.GameUpdate, { sender, data });
    }
  }

  private broadcastGameOver(player: Client, data: {}): void {
    const game = this.state;
    const sender = player.info;
    const dataLoad = { sender, game, data };
    this.broadcastToPeers(player, MessageOutType.GameOver, dataLoad);
  }

  private endGame(): void {
    clearTimeout(this.startTimeout);
    this.endedAt = new Date().toString();
  }

  public onGameOver(client: Client, data: {}): void {
    this.endGame();
    this.broadcastGameOver(client, data);
  }

  public onPlayerLeft(client: Client): void {
    clearTimeout(this.startTimeout);
    this.removeFromClients(client);
    this.broadcastPlayerLeft(client);
  }

  private broadcastPlayerLeft(playerLeft: Client): void {
    const sender = playerLeft.info;
    const game = this.details;
    this.broadcastToPeers(playerLeft, MessageOutType.PlayerLeft, {sender, game});
  }

  public broadcastGameMessage(player: Client, data: {}): void {
    const sender = player.info;
    this.broadcastToPeers(player, MessageOutType.GameMessage, { sender, data });
  }

}
