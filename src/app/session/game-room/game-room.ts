import { Client } from "../../client/client";
import { getDurationFromDates, randomFromArray } from "../../../utils/utils";
import { Duration } from "../../duration.interface";
import { Session } from "../session";
import { ConfigUtils, GameConfig } from "./game-config/game-config";
import { GameInfo, PlayerEntrance } from "./game.interfaces";
import { ErrorType } from "../../error-type.enum";
import { MessageOutType } from "../../messages/message-types/message-types.enum";

export class GameRoom extends Session {
  private startTimeout: ReturnType<typeof setTimeout>;
  private _config: GameConfig;
  private _settings: {} = {};
  private startedAt: string;
  private endedAt: string;
  private playerStartId: string;
  public key: string;

  constructor(config: GameConfig, settings?: {}) {
    super();
    this._config = ConfigUtils.getValidGameConfig(config);
    this.key = ConfigUtils.generateGameKey(config);
    this._settings = settings;
    this.init();
  }
  // protected
  private setStartingPlayer(): void {
    const playersIds = this.clients.map((client) => client.id);
    this.playerStartId = randomFromArray<string>(playersIds);
  }

  private get filled(): boolean {
    return this.numberOfClients === this._config.playersAllowed;
  }

  private get idle(): boolean {
    return !this.startedAt && !this.endedAt;
  }

  private get completedIn(): Duration {
    const start = this.startedAt ? new Date(this.startedAt) : undefined;
    const end = this.endedAt ? new Date(this.endedAt) : undefined;
    return getDurationFromDates(start, end);
  }

  public get entranceAllowed(): boolean {
    return !this.filled && this.idle;
  }

  public get info(): GameInfo {
    return {
      id: this.id,
      createdAt: this.createdAt,
      filled: this.filled,
      idle: this.idle,
      roomType: this._config.roomType,
      playersAllowed: this._config.playersAllowed,
      startWaitingTime: this._config.startWaitingTime,
    };
  }

  public get details(): GameInfo {
    return {
      ...this.info,
      settings: this._settings,
      players: this.clientsInfo,
      playerStartId: this.playerStartId,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      completedIn: this.completedIn,
    };
  }

  private get startAllowed(): boolean {
    return this.filled && this.idle;
  }

  private init(): void {
    this.playerStartId = undefined;
    this.startedAt = undefined;
    this.endedAt = undefined;
  }

  public joinClient(client: Client): void {
      !this.entranceAllowed ?this.broadcastForbiddenEntrance(client) : this.addPlayer(client);
  }

  private addPlayer(client: Client): void {
    client.gameRoomId = this.id;
    this.addClient(client);
    this.broadcastRoomOpened(client);
    this.broadcastPlayerEntrance(client);
    this.checkGameStart();
  }

  private checkGameStart(): void {
    clearTimeout(this.startTimeout);
    if (this.startAllowed) {
      this.startTimeout = setTimeout(() => this.startGame(), this._config.startWaitingTime);
    }
  }

  private startGame(): void {
    clearTimeout(this.startTimeout);
    if (this.startAllowed) {
      this.init();
      this.setStartingPlayer();
      this.startedAt = new Date().toString();
      this.broadcastGameStart();
    }
  }

  // MESSAGE BROADCAST
  private getPlayerEntranceData(client: Client): PlayerEntrance {
    return {
      playerJoined: client.info,
      game: this.details,
    };
  }

  private broadcastForbiddenEntrance(client: Client): void {
    client.sendErrorMessage(ErrorType.GameEntranceForbidden, this.info);
  }

  private broadcastRoomOpened(client: Client): void {
    client.sendMessage(MessageOutType.GameRoomOpened, this.getPlayerEntranceData(client));
  }

  private broadcastPlayerEntrance(clientJoined: Client): void {
    const data = this.getPlayerEntranceData(clientJoined);
    this.broadcastToPeers(clientJoined, MessageOutType.PlayerJoined, data);
  }

  private broadcastGameStart(): void {
    this.clients.forEach((client) =>
      client.sendMessage(MessageOutType.GameStart, this.details)
    );
  }
}
