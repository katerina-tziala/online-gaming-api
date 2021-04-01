import { getDurationFromDates } from '../../../utils/utils';
import { Duration } from '../../duration.interface';
import { Session } from '../session';
import { ConfigUtils, GameConfig } from './game-config/game-config';
import { GameInfo } from './game.interfaces';

export class GameRoom extends Session {
  public startTimeout: ReturnType<typeof setTimeout>;
  public _config: GameConfig;
  public _settings: {} = {};
  public key: string;
  public startedAt: string;
  public endedAt: string;
  public playerStartId: string;
  // public restartRequest: GameRestart;

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

  public get idle(): boolean {
    return !this.startedAt && !this.endedAt;
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

  // private get restartConfirmedIds(): string[] {
  //   return this.restartRequest ? [] : this.restartRequest.playersConfirmed.map(peerPlayer => peerPlayer.id);
  // }

  // private get restartExpectedIds(): string[] {
  //   return this.restartRequest ? [] : this.restartRequest.playersExpectedToConfirm.map(peerPlayer => peerPlayer.id);
  // }

  // public joinClient(client: Client): void {
  //   if (!this.entranceAllowed) {
  //     client.sendError(MessageErrorType.GameEntranceForbidden, this.info);
  //     return;
  //   }
  //   this.addClient(client);
  // }

  // public addInClients(client: Client): void {
  //   client.gameRoomId = this.id;
  //   this.restartRequest = undefined;
  //   super.addInClients(client);
  // }

  // public addClient(client: Client): void {
  //   this.addInClients(client);
  //   this.broadcastRoomOpened(client);
  //   this.broadcastPlayerEntrance(client);
  //   this.checkGameStart();
  // }

  // public getOpenedRoomData(client: Client): GameRoomOpened {
  //   return {
  //     user: client.info,
  //     game: this.details,
  //   };
  // }

  // public broadcastRoomOpened(client: Client): void {
  //   client.notify(MessageOutType.GameRoomOpened, this.getOpenedRoomData(client));
  // }

  // public getPlayerEntranceData(clientJoined: Client): PlayerEntrance {
  //   return {
  //     playerJoined: clientJoined.info,
  //     game: this.details
  //   };
  // }

  // public broadcastPlayerEntrance(clientJoined: Client): void {
  //   const data = this.getPlayerEntranceData(clientJoined);
  //   this.broadcastToPeers(clientJoined, MessageOutType.PlayerJoined, data);
  // }

  // public broadcastToPeers(initiator: Client, type: MessageOutType,  data: {}): void {
  //   const peers = this.getClientPeers(initiator);
  //   peers.forEach((client) => client.notify(type, data));
  // }

  // public checkGameStart(): void {
  //   clearTimeout(this.startTimeout);
  //   if (this.readyToStart) {
  //     this.startTimeout = setTimeout(() => {
  //       this.startGame();
  //     }, this._config.startWaitingTime);
  //   } else {
  //     console.log('not readyToStart');

  //   }
  // }

  // public init() {
  //   this.restartRequest = undefined;
  //   this.playerStartId = undefined;
  //   this.startedAt = undefined;
  //   this.endedAt = undefined;
  // }
  // public startGame(): void {
  //   if (this.readyToStart) {
  //     this.init();
  //     const playersIds = this.clients.map((client) => client.id);
  //     this.playerStartId = getRandomValueFromArray(playersIds);
  //     this.startedAt = new Date().toString();
  //     this.broadcastGameStart();
  //   }
  //   clearTimeout(this.startTimeout);
  // }

  // public broadcastGameStart(): void {
  //   this.clients.forEach((client) =>
  //     client.notify(MessageOutType.GameStart, this.details)
  //   );
  // }

  // public broadcastGameOver(player: Client, data: {}): void {
  //   const game = this.state;
  //   const sender = player.info;
  //   const dataLoad = { sender, game, data };
  //   this.broadcastToPeers(player, MessageOutType.GameOver, dataLoad);
  // }

  // public endGame(): void {
  //   clearTimeout(this.startTimeout);
  //   this.endedAt = new Date().toString();
  // }

  // public broadcastGameUpdate(player: Client, data: {}): void {
  //   if (this.playersExpectedOnMessage(player, MessageInType.GameUpdate)) {
  //     return;
  //   }
  //   if (this.restartRequest) {
  //     player.sendError(MessageErrorType.CannotUpdateWhenRestartRequested, { type: MessageInType.GameUpdate, data});
  //     return;
  //   }
  //   if (!this.endedAt) {
  //     const sender = player.info;
  //     this.broadcastToPeers(player, MessageOutType.GameUpdate, { sender, data });
  //   }
  // }

  // public onGameOver(player: Client, data: {}): void {
  //   if (this.playersExpectedOnMessage(player, MessageInType.GameOver)) {
  //     return;
  //   }
  //   if (this.restartRequest) {
  //     player.sendError(MessageErrorType.CannotEndWhenRestartRequested, { type: MessageInType.GameOver, data});
  //     return;
  //   }
  //   this.endGame();
  //   this.broadcastGameOver(player, data);
  // }

  // public onPlayerLeft(client: Client): void {
  //   clearTimeout(this.startTimeout);
  //   this.removeFromClients(client);
  //   this.restartRequest = undefined;
  //   this.broadcastPlayerLeft(client);
  //   // if request restart notify the rest?
  // }

  // public broadcastPlayerLeft(playerLeft: Client): void {
  //   const sender = playerLeft.info;
  //   const game = this.details;
  //   this.broadcastToPeers(playerLeft, MessageOutType.PlayerLeft, {sender, game});
  // }

  // public broadcastGameMessage(player: Client, data: {}): void {
  //   if (!this.playersExpectedOnMessage(player, MessageInType.GameMessage)) {
  //     const sender = player.info;
  //     this.broadcastToPeers(player, MessageOutType.GameMessage, { sender, data });
  //   }
  // }

  // private playersExpectedOnMessage(player: Client, type: MessageInType): boolean {
  //   if (!this.filled) {
  //     player.sendError(MessageErrorType.WaitForPlayersToJoin, { type });
  //     return true
  //   }
  //   return false;
  // }

  // public onRequestRestart(player: Client): void {
  //   if (this.playersExpectedOnMessage(player, MessageInType.GameRestartRequest)) {
  //     return;
  //   }
  //   if (!this.startedAt) {
  //     player.sendError(MessageErrorType.GameNotStarted, { type: MessageInType.GameRestartRequest});
  //   } else if (this.restartRequest) {
  //     this.onRequestRestartWhenRequestExists(player);
  //   } else {
  //     this.createRestartRequest(player);
  //   }
  // }

  // private onRequestRestartWhenRequestExists(player: Client): void {
  //   if (this.restartExpectedIds.includes(player.id)) {
  //     this.onRestartAcceptedByPlayer(player);
  //   } else {
  //     this.broadcastRestartConfirmationWaiting(player);
  //   }
  // }

  // private createRestartRequest(player: Client): void {
  //   const playerPeers = this.getClientPeers(player);
  //   this.restartRequest = {
  //     id: this.id + generateId(),
  //     createdAt: new Date().toString(),
  //     playerRequested: player.info,
  //     playersConfirmed: [],
  //     playersExpectedToConfirm: playerPeers.map(peerPLayer => peerPLayer.info)
  //   };
  //  this.broadcastRestartStateToPeers(player, MessageOutType.GameRestartRequest);
  // }

  // private broadcastRestartStateToPeers(player: Client, type: MessageOutType): void {
  //   const restartRequest = this.restartRequest;
  //   const game = this.info;
  //   this.broadcastToPeers(player, MessageOutType.GameRestartRequest, {restartRequest, game});
  // }

  // public onRestartReject(player: Client): void {
  //   if (!this.restartRequestExistsOnAction(player, MessageInType.GameRestartReject)) {
  //     return;
  //   }
  //   const replyType = (this.restartRequest.playerRequested.id === player.id) ?
  //   MessageOutType.GameRestartCanceled
  //   : MessageOutType.GameRestartRejected;
  //   this.restartRequest = undefined;
  //   this.broadcastRestartRejection(player, replyType);
  // }

  // private restartRequestExistsOnAction(player: Client, type: MessageInType): boolean {
  //   if (!this.restartRequest) {
  //     player.sendError(MessageErrorType.RestartNotRequested, { type});
  //     return false;
  //   }
  //   return true;
  // }

  // public onRestartAccept(player: Client): void {
  //   if (!this.restartRequestExistsOnAction(player, MessageInType.GameRestartAccept)) {
  //     return;
  //   }
  //   if (this.restartRequest.playerRequested.id === player.id || this.restartConfirmedIds.includes(player.id)) {
  //     this.broadcastRestartConfirmationWaiting(player);
  //   } else {
  //     this.onRestartAcceptedByPlayer(player);
  //   }
  // }

  // private onRestartAcceptedByPlayer(player: Client): void {
  //   this.restartRequest.playersConfirmed.push(player.info);
  //   this.restartRequest.playersExpectedToConfirm = this.restartRequest.playersExpectedToConfirm.filter(peerPlayer => peerPlayer.id !== player.id);
  //   this.broadcastAcceptedRestart();
  //   if (!this.restartRequest.playersExpectedToConfirm.length) {
  //     this.init();
  //     this.checkGameStart();
  //   }
  // }

  // private broadcastAcceptedRestart(): void {
  //   const restartRequest = this.restartRequest;
  //   const game = this.info;
  //   this.clients.forEach(client => {
  //     client.notify(MessageOutType.GameRestartAccepted, {restartRequest, game});
  //   });
  // }

  // private broadcastRestartRejection(player: Client, type: MessageOutType): void {
  //   const sender = player.info;
  //   this.restartRequest = undefined;
  //   this.broadcastToPeers(player, type, { sender });
  // }

  // private broadcastRestartConfirmationWaiting(player: Client): void {
  //   const restartRequest = this.restartRequest;
  //   const game = this.info;
  //   player.notify(MessageOutType.GameRestartWaitPlayers, { restartRequest, game});
  // }

}
