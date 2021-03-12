import { UserData } from "../interfaces/user-data.interface";
import { MessageOutType } from "../messages/message-types.enum";
import { getRandomValueFromArray } from "../utilities/app-utils";
import { Client } from "../utilities/client";
import { Session } from "./session";
import {
  generateId,
  getArrayFromMap,
  getDurationFromDates,
} from "../utilities/app-utils";
export class GameRoomSession extends Session {
  public roomType: string;
  public url: string;
  private allowedPlayers: number = 2;
  private _origin: string;
  private _properties: {} = {};
  private startTimeout: ReturnType<typeof setTimeout>;

  private playerStartId: string = null;
  private startedAt: Date = null;
  private endedAt: Date = null;

  constructor(origin: string, allowedPlayers = 2, type = "default") {
    super();
    this._origin = origin;
    this.url = `${this._origin}?gameId=${this.id}`;
    this.allowedPlayers = allowedPlayers;
    this.roomType = type;
  }

  private setGameStart(): void {
    const playersIds = this.clientsList.map((client) => client.id);
    this.playerStartId = getRandomValueFromArray(playersIds);
    this.startedAt = new Date();
  }

  public get roomFilled(): boolean {
    return this.clientsList.length === this.allowedPlayers;
  }

  public set properties(properties: {}) {
    this._properties = properties || this._properties;
  }

  public get details() {
    const gameDetails = {
      id: this.id,
      roomType: this.roomType,
      url: this.url,
      allowedPlayers: this.allowedPlayers,
      roomFilled: this.roomFilled,
      players: this.clientsList.map((client) => client.details),
      playerStartId: this.playerStartId,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
    };
    return { ...gameDetails, ...this._properties };
  }

  public addInClients(client: Client): void {
    client.gameRoomId = this.id;
    super.addInClients(client);
    this.broadcastPlayerEntrance(client);
  }

  public joinGame(client: Client): void {
    if (this.roomFilled || this.startedAt || this.endedAt) {
      console.log("no more players allowed");
      return;
    }

    this.addInClients(client);
    client.sendRoomOpened(this.details);

    if (this.roomFilled) {
      this.checkGameStart();
    }
  }

  /** start game 5 seconds after all players joined the game */
  private checkGameStart(): void {
    clearTimeout(this.startTimeout);
    this.startTimeout = setTimeout(() => {
      if (this.roomFilled) {
        this.setGameStart();
        this.broadcastGameStart();
      }
      clearTimeout(this.startTimeout);
    }, 10000);
  }


  private getGameStateBroadcastData<T>(initiator: Client, data: T): {} {
    return {
      gameState: data,
      sender: initiator.details
    };
  }

  // FUNCTIONS TO SEND MESSAGES
  private broadcastToPeers<T>(initiator: Client, type: MessageOutType, data: T): void {
    const peers = this.getClientPeers(initiator);
    peers.forEach((client) => {
      client.notify(type, data);
    });
  }

  private broadcastPlayerEntrance(playerJoined: Client): void {
    const data = { game: this.details, playerJoined: playerJoined.details };
    this.broadcastToPeers(playerJoined, MessageOutType.GameUpdate, data);
  }

  private broadcastGameStart(): void {
    this.clientsList.forEach((client) => {
      client.notify(MessageOutType.GameStart, this.details);
    });
  }

  public broadcastGameUpdate<T>(player: Client, data: T): void {
    if (!this.endedAt) {
      const broadcastData = this.getGameStateBroadcastData(player, data);
      this.broadcastToPeers(player, MessageOutType.GameUpdate, broadcastData);
    }
  }

  public gameOver<T>(player: Client, data: T): void {
    this.endedAt = new Date();
    const duration = getDurationFromDates(this.startedAt, this.endedAt);
    const gameOverData = { ...data, ...this.details, ...duration};
    const broadcastData = this.getGameStateBroadcastData(player, gameOverData);
    this.broadcastToPeers(player, MessageOutType.GameOver, broadcastData);
  }
}
