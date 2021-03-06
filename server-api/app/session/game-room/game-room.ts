import { Chat } from '../../chat.interface';
import { Client } from '../../client/client';
import { ClientData } from '../../client/client-data.interface';
import { ErrorType } from '../../error-type.enum';
import { Game } from '../../game/game';
import { ConfigUtils, GameConfig } from '../../game/game-config/game-config';
import { GameRestartHandler } from '../../game/restart/game-restart-handler';
import {
  MessageInType,
  MessageOutType,
} from '../../messages/message-types/message-types';
import { MessageIn } from '../../messages/message.interface';
import { Session } from '../session';
import { GameMessagingChecker } from './game-messaging-checker';
import {
  GameInfo,
  GameRoomInfo,
  GameState,
  PlayerInOut,
  PlayerMessage,
} from './game.interfaces';

export class GameRoom extends Session {
  private startTimeout: ReturnType<typeof setTimeout>;
  private _config: GameConfig;
  public key: string;
  private _messageHandlingConfig: Map<
    string,
    (client: Client, data?: {}) => void
  > = new Map();
  private _Game: Game;
  private _RestartHandler: GameRestartHandler;

  constructor(config: GameConfig) {
    super();
    this.id = 'game-' + this.id;
    this._config = ConfigUtils.getValidGameConfig(config);
    this.key = ConfigUtils.generateGameKey(config);
    this._Game = new Game(this._config);
    this.setMessageHandling();
    this.initRequestHandler();
  }

  private initRequestHandler(): void {
    if (this._config.restartAllowed) {
      this._RestartHandler = new GameRestartHandler(this.id, this.onRestartGame.bind(this));
    }
  }

  private setMessageHandling(): void {
    this._messageHandlingConfig.set(MessageInType.GameState, this.onGetGameState.bind(this));
    this._messageHandlingConfig.set(MessageInType.GameChat, this.onGameChat.bind(this));
    this._messageHandlingConfig.set(MessageInType.GameUpdate, this.onGameUpdate.bind(this));
    this._messageHandlingConfig.set(MessageInType.GameOver, this.onGameOver.bind(this));
    this._messageHandlingConfig.set(MessageInType.GameTurnMove, this.onPlayerTurnMove.bind(this));
    this._messageHandlingConfig.set(MessageInType.GameMoveSubmit, this.onPlayerMoveSubmit.bind(this));
    this._messageHandlingConfig.set(MessageInType.GamePlayerInfo, this.onGetPlayerInfo.bind(this));
  }

  protected get allPlayersJoined(): boolean {
    return this.numberOfClients === this._config.playersRequired;
  }

  private get idle(): boolean {
    return this._Game.idle;
  }

  public get entranceAllowed(): boolean {
    return !this.allPlayersJoined && this.idle;
  }

  private get restartRequested(): boolean {
    return this._RestartHandler ? this._RestartHandler.requested : false;
  }

  public get info(): GameRoomInfo {
    return {
      id: this.id,
      createdAt: this.createdAt,
      key: this.key,
      config: this._config,
      allPlayersJoined: this.allPlayersJoined,
    };
  }

  public get gameState(): GameState {
    const gameState = this._Game.state;
    gameState.players = this.playersInfo;
    return gameState;
  }

  public get playersInfo(): ClientData[] {
    return this.clients.map((client) => this._Game.getPlayerInfo(client));
  }

  public get details(): GameInfo {
    const gameState = Object.assign(this.gameState, this._Game.finalState);
    const details: GameInfo = {
      ...this.info,
      gameState,
    };

    if (this.restartRequested) {
      details.restartRequest = this._RestartHandler.restartRequest;
    }

    return details;
  }

  private get filledAndIdle(): boolean {
    return this.allPlayersJoined && this.idle;
  }

  private get playersJoinedError(): ErrorType {
    return !this.allPlayersJoined ? ErrorType.WaitForPlayers : undefined;
  }

  private get restartRequestError(): ErrorType {
    return this.restartRequested ? ErrorType.RestartRequested : undefined;
  }

  private get gameMoveError(): ErrorType {
    return (
      this.restartRequestError ||
      this.playersJoinedError ||
      this._Game.gameStartError ||
      this._Game.gameEndedError
    );
  }

  private endGame(): void {
    this.clearStartTimeout();
    this._Game.endGame();
  }

  protected joinPlayer(client: Client): void {
    client.gameId = this.id;
    this._Game.init();
    this.addClient(client);
    this.initRequestHandler();
    this.broadcastRoomOpened(client);
  }

  protected addPlayer(client: Client): void {
    this.joinPlayer(client);
    this.broadcastPlayerInOut(client, MessageOutType.PlayerJoined);
    this.checkGameStart();
  }

  private checkGameStart(): void {
    this.clearStartTimeout();
    if (this.filledAndIdle) {
      this.startTimeout = setTimeout(
        () => this.startGame(),
        this._config.startWaitingTime
      );
    }
  }

  private restartGame(): void {
    this.clearStartTimeout();
    if (this.allPlayersJoined) {
      this._Game.initGameState();
      this.broadcastGameStart();
    }
  }

  private onRestartGame(): void {
    this.clearStartTimeout();
    this._Game.init();
    if (this.allPlayersJoined) {
      this.startTimeout = setTimeout(
        () => this.restartGame(),
        this._config.startWaitingTime
      );
    }
  }

  private startGame(): void {
    this.clearStartTimeout();
    if (this.filledAndIdle && !this.restartRequested) {
      this._Game.start(this.clientsIds);
      this.broadcastGameStart();
    }
  }

  public joinClient(client: Client): void {
    !this.entranceAllowed
      ? this.broadcastForbiddenEntrance(client)
      : this.addPlayer(client);
  }

  public onPlayerLeft(client: Client): void {
    this.removePlayer(client);
    if (this.restartRequested) {
      this._RestartHandler.onRestartReject(client);
      this.initRequestHandler();
      this.broadcastPlayerInOut(client, MessageOutType.PlayerLeft);
    } else if (!this._Game.over) {
      this.endGame();
      this.broadcastGameOver(client, {
        playerLeft: this._Game.getPlayerInfo(client),
      });
    } else {
      this.broadcastPlayerInOut(client, MessageOutType.PlayerLeft);
    }
  }

  protected clearStartTimeout(): void {
    clearTimeout(this.startTimeout);
  }

  protected removePlayer(client: Client): void {
    this.clearStartTimeout();
    this.removeClient(client);
    client.gameId = null;
  }

  public onMessage(client: Client, message: MessageIn): void {
    const { type, data } = message;
    if (this._messageHandlingConfig.has(type)) {
      this._messageHandlingConfig.get(type)(client, data);
    } else {
      this.onMessageForRestart(client, message);
    }
  }

  public onMessageForRestart(client: Client, message: MessageIn): void {
    const { type } = message;
    if (!this._RestartHandler) {
      client.sendErrorMessage(ErrorType.GameRestartForbidden, {
        messageType: type,
      });
      return;
    }
    this.onRestartMessageWhenAllowed(client, message);
  }

  public onRestartMessageWhenAllowed(client: Client, message: MessageIn): void {
    const { type } = message;
    const errorType = this.playersJoinedError || this._Game.gameStartError;
    if (errorType) {
      client.sendErrorMessage(errorType, { messageType: type });
      return;
    }
    this._RestartHandler.onMessage(client, type, this.getClientPeers(client));
  }

  public onGetPlayerInfo(client: Client, data: { playerId: string }): void {
    const playerId = data?.playerId || client.id;
    const player = this.getClientById(playerId);
    if (!player) {
      client.sendErrorMessage(ErrorType.PlayerNotFound, { playerId });
    }

    const playerInfo = this._Game.getPlayerInfo(player);
    client.sendMessage(MessageOutType.GamePlayerInfo, { playerInfo });
  }

  private onGetGameState(client: Client): void {
    client.sendMessage(MessageOutType.GameState, this.details);
  }

  private onGameChat(client: Client, data: Chat): void {
    const messageType = MessageInType.GameChat;
    const errorType =
      GameMessagingChecker.gameChatError(data) || this.playersJoinedError;
    if (errorType) {
      client.sendErrorMessage(errorType, { messageType });
    } else {
      this.broadcastGameChat(client, data);
    }
  }

  private onGameUpdate(client: Client, data: {}): void {
    const messageType = MessageInType.GameUpdate;
    if (!GameMessagingChecker.dataValid(data)) {
      client.sendErrorMessage(ErrorType.DataRequired, { messageType });
      return;
    }
    if (
      this.gameMoveAllowed(client, messageType) &&
      this.gameMoveAllowedForPlayerOnTurn(client, messageType)
    ) {
      this.broadcastGameMoveUpdate(client, data);
    }
  }

  private gameMoveAllowedForPlayerOnTurn(client: Client, messageType: MessageInType): boolean {
    const errorType = this._Game.onTurnError(client);
    if (errorType) {
      this.broadcastErrorOnMove(client, errorType, messageType);
      return false;
    }
    return true;
  }

  private gameMoveAllowed(client: Client, messageType: MessageInType): boolean {
    const errorType = this.gameMoveError;
    if (errorType) {
      this.broadcastErrorOnMove(client, errorType, messageType);
      return false;
    }
    return true;
  }

  private onPlayerTurnMove(client: Client, data: {}): void {
    const messageType = MessageInType.GameTurnMove;
    if (!this._Game.turnsConfigured) {
      client.sendErrorMessage(ErrorType.TurnsSwitchForbidden, { messageType });
      return;
    }
    if (this.gameMoveAllowed(client, messageType) && this.gameMoveAllowedForPlayerOnTurn(client, messageType)) {
      this.submitPlayerTurn(client, data);
    }
  }

  private submitPlayerTurn(client: Client, data: {}) {
    if (!this._Game.collectingMoves) {
      this._Game.switchTurns();
      this.broadcastTurnMove(data);
      return;
    }
    const messageType = MessageInType.GameTurnMove;
    if (this.moveCollected(client, data, messageType)) {
      this._Game.switchTurns();
      this.broadcastTurnMove(data);
      this.checkAllMovesCollected();
    }
  }

  private onPlayerMoveSubmit(client: Client, data: any): void {
    const messageType = MessageInType.GameMoveSubmit;
    if (
      this.gameMoveAllowed(client, messageType) &&
      this.gameMoveAllowedForPlayerOnTurn(client, messageType)
    ) {
      this.submitMoveToCollection(client, data);
    }
  }

  private moveCollected(client: Client, data: any, messageType: MessageInType): boolean {
    const errorType = this._Game.submitMove(client, data);
    if (errorType) {
      this.broadcastErrorOnMove(client, errorType, messageType);
      return false;
    }
    return true;
  }

  private submitMoveToCollection(client: Client, data: any): void {
    const messageType = MessageInType.GameMoveSubmit;
    if (!this.moveCollected(client, data, messageType)) {
      return;
    }
    if (this._Game.turnsConfigured) {
      this._Game.switchTurns();
      this.broadcastTurnMove(data);
    }
    this.checkAllMovesCollected();
  }

  public checkAllMovesCollected(): void {
    if (!this._Game.allMovesSubmitted) {
      return;
    }
    this.broadcastMovesCollection();
    this._Game.initMovesCollection();
  }

  public broadcastMovesCollection(): void {
    this.broadcastToClients(MessageOutType.GameMovesCollection, this.details);
  }

  private onGameOver(client: Client, data: {}): void {
    if (this.gameMoveAllowed(client, MessageInType.GameOver)) {
      this.endGame();
      this.broadcastGameOver(client, data);
    }
  }

  // MESSAGE BROADCAST
  private getPlayerMoveMessage(client: Client, data?: {}): PlayerMessage {
    return {
      sender: this._Game.getPlayerInfo(client),
      game: this.details,
      moveData: data,
    };
  }

  protected getPlayerInOutData(client: Client): PlayerInOut {
    return {
      player: client.info,
      game: this.details,
    };
  }

  private broadcastForbiddenEntrance(client: Client): void {
    client.sendErrorMessage(ErrorType.GameEntranceForbidden, this.info);
  }

  private broadcastRoomOpened(client: Client): void {
    client.sendMessage(
      MessageOutType.GameRoomOpened,
      this.getPlayerInOutData(client)
    );
  }

  private broadcastGameStart(): void {
    const gameState = Object.assign(this.gameState, this._Game.initialState);
    const data = {
      id: this.id,
      gameState,
    };
    this.broadcastToClients(MessageOutType.GameStart, data);
  }

  protected broadcastPlayerInOut(client: Client, type: MessageOutType): void {
    const data = this.getPlayerInOutData(client);
    this.broadcastToPeers(client, type, data);
  }

  private broadcastGameChat(client: Client, data: Chat): void {
    const message = {
      sender: client.info,
      content: data.content,
      deliveredAt: new Date().toString(),
    };
    this.broadcastToPeers(client, MessageOutType.GameChat, message);
  }

  private broadcastGameOver(client: Client, data?: {}): void {
    const message = this.getPlayerMoveMessage(client, data);
    this.broadcastToPeers(client, MessageOutType.GameOver, message);
  }

  public broadcastPlayerUpdate(client: Client): void {
    this.broadcastToPeers(
      client,
      MessageOutType.PlayerUpdate,
      this._Game.getPlayerInfo(client)
    );
  }

  public broadcastGameMoveUpdate(client: Client, data: {}): void {
    const message = this.getPlayerMoveMessage(client, data);
    this.broadcastToPeers(client, MessageOutType.GameUpdate, message);
  }

  private broadcastTurnMove(data: {}): void {
    const message = { game: this.details, moveData: data };
    this.broadcastToClients(MessageOutType.PlayerTurnMove, message);
  }

  private broadcastErrorOnMove(client: Client, errorType: ErrorType, messageType: MessageInType): void {
    client.sendErrorMessage(errorType, { messageType, game: this.details });
  }
}
