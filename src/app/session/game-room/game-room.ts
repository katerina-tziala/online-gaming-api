import { Client } from "../../client/client";
import { getDurationFromDates, randomFromArray } from "../../../utils/utils";
import { Duration } from "../../duration.interface";
import { Session } from "../session";
import { ConfigUtils, GameConfig } from "./game-config/game-config";
import { GameInfo, PlayerInOut, PlayerMesssage } from "./game.interfaces";
import { ErrorType } from "../../error-type.enum";
import { MessageInType, MessageOutType } from "../../messages/message-types/message-types.enum";
import { MessageIn } from "../../messages/message.interface";
import { Chat } from "../../chat.interface";
import { GameMessagingChecker } from "./game-messaging-checker";

export class GameRoom extends Session {
  private startTimeout: ReturnType<typeof setTimeout>;
  private _config: GameConfig;
  private startedAt: string;
  private endedAt: string;
  private playerStartId: string;
  public key: string;
  private _messageHandlingConfig: Map<string, (client: Client, data?: {}) => void> = new Map();

  constructor(config: GameConfig) {
    super();
    this.setMessageHandling();
    this._config = ConfigUtils.getValidGameConfig(config);
    this.key = ConfigUtils.generateGameKey(config);
    this.init();
  }

  protected setMessageHandling(): void {
    this._messageHandlingConfig.set(MessageInType.GameState, this.onGetGameState.bind(this));
    this._messageHandlingConfig.set(MessageInType.GameChat, this.onGameChat.bind(this));
    this._messageHandlingConfig.set(MessageInType.GameUpdate, this.onGameUpdate.bind(this));
    this._messageHandlingConfig.set(MessageInType.GameOver, this.onGameOver.bind(this));
  }

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
      settings: this._config.settings,
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

  private endGame(): void {
    clearTimeout(this.startTimeout);
    this.endedAt = new Date().toString();
  }

  private addPlayer(client: Client): void {
    client.gameRoomId = this.id;
    this.addClient(client);
    this.broadcastRoomOpened(client);
    this.broadcastPlayerInOut(client, MessageOutType.PlayerJoined);
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

  public joinClient(client: Client): void {
    !this.entranceAllowed ? this.broadcastForbiddenEntrance(client) : this.addPlayer(client);
  }

  public onPlayerLeft(client: Client): void {
    clearTimeout(this.startTimeout);
    this.removeClient(client);
    client.gameRoomId = null;
    this.broadcastPlayerInOut(client, MessageOutType.PlayerLeft);
  }

  public onMessage(client: Client, message: MessageIn): void {
    const { type, data } = message;
    if (this._messageHandlingConfig.has(type)) {
      this._messageHandlingConfig.get(type)(client, data);
    }
  }

  private onGetGameState(client: Client): void {
    client.sendMessage(MessageOutType.GameState, this.details);
  }

  private onGameChat(client: Client, data: Chat): void {
    const messageType = MessageInType.GameChat;
    const errorType = GameMessagingChecker.gameChatError(this.info, data);
    if (errorType) {
      client.sendErrorMessage(errorType, { messageType });
    } else {
      this.broadcastGameChat(client, data);
    }
  }

  private onGameUpdate(client: Client, data: {}): void {
    const messageType = MessageInType.GameUpdate;
    const errorType = GameMessagingChecker.gameUpdateError(this.details, data);
    if (errorType) {
      client.sendErrorMessage(errorType, { messageType });
    } else {
      this.broadcastToPeers(client, MessageOutType.GameUpdate, this.getPlayerMessage(client, data));
    }
  }

  private onGameOver(client: Client, data: {}): void {
    const messageType = MessageInType.GameOver;
    const errorType = GameMessagingChecker.gameOverError(this.details);
    if (errorType) {
      client.sendErrorMessage(errorType, { messageType });
    } else {
      this.endGame();
      this.broadcastGameOver(client, data);
    }
  }







  // MESSAGE BROADCAST
  private getPlayerMessage(client: Client, data?: {}): PlayerMesssage {
    return {
      sender: client.info,
      data,
    };
  }

  private getPlayerInOutData(client: Client): PlayerInOut {
    return {
      player: client.info,
      game: this.details,
    };
  }

  private broadcastForbiddenEntrance(client: Client): void {
    client.sendErrorMessage(ErrorType.GameEntranceForbidden, this.info);
  }

  private broadcastRoomOpened(client: Client): void {
    client.sendMessage(MessageOutType.GameRoomOpened, this.getPlayerInOutData(client));
  }

  private broadcastGameStart(): void {
    this.clients.forEach((client) =>
      client.sendMessage(MessageOutType.GameStart, this.details)
    );
  }

  private broadcastPlayerInOut(client: Client, type: MessageOutType): void {
    const data = this.getPlayerInOutData(client);
    this.broadcastToPeers(client,type, data);
  }

  private broadcastGameChat(client: Client, data: Chat): void {
    const message = {
      sender: client.info,
      content: data.content,
      deliveredAt: new Date().toString()
    };
    this.broadcastToPeers(client, MessageOutType.GameChat, message);
  }

  private broadcastGameOver(client: Client, data: {}): void {
    const message = this.getPlayerMessage(client, data);
    message.game = this.details;
    this.broadcastToPeers(client, MessageOutType.GameOver, message);
  }
}
