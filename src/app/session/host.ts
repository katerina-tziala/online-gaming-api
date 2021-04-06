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

  private gameBasedMessage(type: MessageInType): boolean {
    return this._gameMessages.includes(type);
  }
  private broadcastPeersUpdate(client: Client): void {
    let peers = this.getClientPeers(client);
    peers = peers.filter(peer => !peer.gameRoomId);
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
    const { username, gameRoomId, properties } = data || {};
    if (client.usernameUpdated(username, this.getPeersUsernames(client))) {
      client.properties = properties;
      this.joinNewClient(client, gameRoomId);
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

    if (!client.gameRoomId) {
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
    client.gameRoomId = null;
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
    const gameRoom = this._GameRoomsController.getGameRoomById(client.gameRoomId);
    if (client.updated(data, this.getPeersUsernames(client))) {
      gameRoom ? gameRoom.broadcastPlayerUpdate(client) : this.addInClients(client);
      this.notifyJoinedClient(client, MessageOutType.UserUpdated);
      this.broadcastPeersUpdate(client);
    }
  }

  private onEnterGame(client: Client, data: GameConfig): void {
    this._GameRoomsController.enterClientInGame(client, data);
    if (client.gameRoomId) {
      this.broadcastPeersUpdate(client);
    }
  }

  private onOpenGame(client: Client, data: GameConfig): void {
    this._GameRoomsController.enterClientInNewGame(client, data);
    if (client.gameRoomId) {
      this.broadcastPeersUpdate(client);
    }
  }


  private onOpenPrivateGame(client: Client, data: GameConfig): void {
    console.log("onOpenPrivateGame");
    const { playersExpected, ...config } = data;

    const expectedPlayers = this.getClientPeers(client);
    this._GameRoomsController.openPrivateGameRoom(client, config, expectedPlayers);
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
    this.broadcastPeersUpdate(client);
  }
}
