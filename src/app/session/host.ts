import { Session } from "./session";
import { Client } from "../client/client";
import { ClientData } from "../client/client-data.interface";
import { ErrorType } from "../error-type.enum";
import {
  MessageOutType,
  MessageInType,
} from "../messages/message-types/message-types.enum";
import { MessageIn } from "../messages/message.interface";
import { Chat } from "../chat.interface";
import { ChatValidator } from "../validators/chat-validator";
import { HostRoomsController } from "../controllers/host-rooms-controller";
import { GameConfig } from "./game-room/game-config/game-config.inteface";

export class Host extends Session {
  private _messageConfig: Map<string, (client: Client, data?: {}) => void> = new Map();
  private _GameRoomsController = new HostRoomsController();
  private _gameMessages = [MessageInType.GameState, MessageInType.GameChat, MessageInType.GameUpdate,
    MessageInType.GameOver, MessageInType.PlayerTurnMove];

  constructor() {
    super();
    this._messageConfig.set(MessageInType.Join, this.onJoinClient.bind(this));
    this._messageConfig.set(MessageInType.UserUpdate, this.onUpdateClient.bind(this));
    this._messageConfig.set(MessageInType.PrivateChat, this.onPrivateChatMessage.bind(this));
    this._messageConfig.set(MessageInType.EnterGame, this.onEnterGame.bind(this));
    this._messageConfig.set(MessageInType.OpenGameRoom, this.onOpenGame.bind(this));
    this._messageConfig.set(MessageInType.OpenPrivateGameRoom, this.onOpenPrivateGame.bind(this));
    this._messageConfig.set(MessageInType.QuitGame, this.onQuitGame.bind(this));
  }
  private notifyJoinedClient(client: Client, type = MessageOutType.Joined): void {
    const user = client.details;
    const peers = this.getPeersDetails(client);
    client.sendMessage(type, { user, peers });
  }

  private notifyClientForPeersUpdate(client: Client): void {
    const peers = this.getPeersDetails(client);
    client.sendMessage(MessageOutType.Peers, { peers });
  }

  private gameBasedMessage(type: MessageInType): boolean {
    return this._gameMessages.includes(type);
  }
  private broadcastPeersUpdate(client: Client): void {
    let peers = this.getClientPeers(client);
    peers = peers.filter(peer => !peer.gameId);
    peers.forEach(peer => this.notifyClientForPeersUpdate(peer));
  }

  public onMessage(client: Client, message: MessageIn): void {
    const { type, data } = message;

    if (type === MessageInType.Join) {
      this.onJoinClient(client, data);
      return;
    }
    if (!this.clientExists(client)) {
      client.sendErrorMessage(ErrorType.NotJoined, message);
      return;
    }
    this.handleMessageForJoinedClient(client, message);
  }

  private handleMessageForJoinedClient(client: Client, message: MessageIn): void {
    const { type } = message;
    if (this.gameBasedMessage(type)) {
      this._GameRoomsController.onGameBasedMessage(client, message);
    } else {
      this.onHostBasedMessage(client, message);
    }
  }

  private onHostBasedMessage(client: Client, message: MessageIn): void {
    const { type, data } = message;
    if (this._messageConfig.has(type)) {
      this._messageConfig.get(type)(client, data || {});
    } else {
      console.log("method type not implemented");
    }
  }

  private onJoinClient(client: Client, data: ClientData): void {
    if (this.clientExists(client)) {
      client.sendErrorMessage(ErrorType.JoinedAlready);
      return;
    }
    const { username, gameId, properties } = data || {};
    if (client.usernameUpdated(username, this.getPeersUsernames(client))) {
      client.properties = properties;
      this.joinNewClient(client, gameId);
    }
  }

  private joinNewClient(client: Client, gameRoomId: string) {
    if (!gameRoomId) {
      this.joinClientInHost(client);
    } else {
      this.joinClientInGame(client, gameRoomId);
    }
  }

  private joinClientInGame(client: Client, gameRoomId: string): void {
    const gameRoom = this._GameRoomsController.getGameRoomById(gameRoomId);
    if (!gameRoom) {
      client.sendGameNotFound(gameRoomId);
      this.joinClientInHost(client);
      return;
    }

    client.setJoined();
    this.addInClients(client);
    gameRoom.joinClient(client);

    if (!client.gameId) {
      this.notifyJoinedClient(client);
    }
    this.broadcastPeersUpdate(client);
  }

  private joinClientInHost(client: Client): void {
    client.setJoined();
    this.addInClients(client);
    this.notifyJoinedClient(client);
    this.broadcastPeersUpdate(client);
  }

  private addInClients(client: Client): void {
    client.gameId = null;
    this.addClient(client);
  }

  private onPrivateChatMessage(client: Client, data: Chat): void {
    const errorType = ChatValidator.privateChatErrorType(data);
    const type = MessageInType.PrivateChat;
    const initialMessage = { type, data };
    if (errorType) {
      client.sendErrorMessage(errorType, initialMessage);
    } else if (client.id === data.recipientId) {
      client.sendErrorMessage(ErrorType.MessageToSelf, initialMessage);
    } else {
      this.sendPrivateChat(client, initialMessage);
    }
  }

  private sendPrivateChat(client: Client, message: MessageIn): void {
    const { data } = message;
    const recipient = this.findClientById(data.recipientId.toString());
    if (!recipient) {
      client.sendErrorMessage(ErrorType.RecipientNotConnected, message);
      return;
    }
    recipient.sendPrivateChat({
      content: data.content,
      sender: client.info,
      deliveredAt: new Date().toString(),
    });
  }

  private onUpdateClient(client: Client, data: ClientData): void {
    const gameRoom = this._GameRoomsController.getGameRoomById(client.gameId);
    if (client.updated(data, this.getPeersUsernames(client))) {
      gameRoom ? gameRoom.broadcastPlayerUpdate(client) : this.addInClients(client);
      this.notifyJoinedClient(client, MessageOutType.UserUpdated);
      this.broadcastPeersUpdate(client);
    }
  }

  private onEnterGame(client: Client, data: GameConfig): void {
    this._GameRoomsController.enterClientInGame(client, data);
    this.checkClientEnteredGame(client);
  }

  private onOpenGame(client: Client, data: GameConfig): void {
    this._GameRoomsController.enterClientInNewGame(client, data);
    this.checkClientEnteredGame(client);
  }

  private checkClientEnteredGame(client: Client): void {
    if (client.gameId) {
      this.broadcastPeersUpdate(client);
    }
  }

  private onOpenPrivateGame(client: Client, data: GameConfig): void {
    const type = MessageInType.OpenPrivateGameRoom;
    const { playersExpected, ...config } = data;
    const { playersToInvite, errorType } = this.getValidPlayersToInvite(client, playersExpected);
    if (errorType) {
      client.sendErrorMessage(errorType, { type, data });
      return;
    }
    this._GameRoomsController.openPrivateGameRoom(client, config, playersToInvite);
    this.checkClientEnteredGame(client);
  }

  private getValidPlayersExpected(client: Client, clientsIds: string[]): string[] {
    const playersExpectedIds = clientsIds || [];
    return playersExpectedIds.filter(clientId => clientId !== client.id);
  }

  private getValidPlayersToInvite(client: Client, playersExpected: string[]): { playersToInvite: Client[], errorType: ErrorType } {
    let errorType;
    const clientsIds = this.getValidPlayersExpected(client, playersExpected);
    const playersToInvite: Client[] = this.getConnectedClientsByIds(clientsIds);
    if (!clientsIds.length) {
      errorType = ErrorType.ExpectedPlayersNotSpecified;
    } else if (clientsIds.length !== playersToInvite.length) {
      errorType = ErrorType.ExpectedClientsNotConnected;
    }
    return { playersToInvite, errorType };
  }





  private onQuitGame(client: Client): void {
    if (client.allowedToSendGameMessage(MessageInType.QuitGame)) {
      this._GameRoomsController.removeClientFromCurrentGame(client);
      this.addInClients(client);
      this.notifyJoinedClient(client, MessageOutType.GameExited);
      this.broadcastPeersUpdate(client);
    }
  }

  public disconnectClient(client: Client): void {
    if (!client) {
      return;
    }
    this._GameRoomsController.removeClientFromCurrentGame(client);
    this.removeClient(client);
    // TODO: find invitations to be rejected
    this.broadcastPeersUpdate(client);
  }
}
