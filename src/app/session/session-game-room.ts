import { Client } from "../utilities/client";
import { Session } from "./session";
import {
  GameConfig,
  GameInfo
} from "../interfaces/game-room.interfaces";
import { TYPOGRAPHY } from "../utilities/constants/typography.constants";
import { MessageOutType } from "../messages/message-types.enum";

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
    this._config = config;
    this._config.playersAllowed = config.playersAllowed || 2;
    this._config.roomType = config.roomType || "default";
    this._config.startWaitingTime = config.startWaitingTime || 3000;
    this.key = `${this._config.roomType}${TYPOGRAPHY.HYPHEN}${this._config.playersAllowed}${TYPOGRAPHY.HYPHEN}${this._config.startWaitingTime}`;
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
    this.broadcastToPeers(clientJoined, MessageOutType.PlayerJoined, { playerJoined });
  }

  private broadcastToPeers(
    initiator: Client, type: MessageOutType, data: {}): void {
    const peers = this.getClientPeers(initiator);
    peers.forEach((client) => client.notify(type, data));
  }

  private checkGameStart(): void {
    clearTimeout(this.startTimeout);
    if (this.filled) {
      console.log("room filled");

    }
    // this.startTimeout = setTimeout(
    //   () => {
    //     this.startGame();
    //   },
    //   this.startWaitingTime);
  }

}
