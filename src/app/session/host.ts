import { Session } from './session';
import { Client } from '../client/client';
import { ClientData } from '../client/client-data.interface';
import { ErrorType } from '../error-type.enum';
import { MessageOutType, MessageInType } from '../messages/message-types/message-types.enum';
import { MessageIn } from '../messages/message.interface';
import { Chat } from '../chat.interface';
import { ChatValidator } from '../validators/chat-validator';

export class Host extends Session {
  private _hostBaseMessaging: Map<
    string,
    (client: Client, data?: {}) => void
  > = new Map();

  constructor() {
    super();
    this._hostBaseMessaging.set(MessageInType.Join, this.onJoinClient.bind(this));
    this._hostBaseMessaging.set(MessageInType.UserUpdate, this.onUpdateClient.bind(this));
    this._hostBaseMessaging.set(MessageInType.PrivateChat, this.onPrivateChatMessage.bind(this));
  }

  private clientUsernameUpdated(client: Client, value: any): boolean {
    const usernamesInSession = this.getPeersUsernames(client);
    return client.usernameUpdated(value, usernamesInSession);
  }

  private addInClients(client: Client): void {
    client.gameRoomId = null;
    this.addClient(client);
  }

  private onPrivateChatMessage(client: Client, data: Chat): void {
    const { errorType } = ChatValidator.validate(data);
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
      deliveredAt: new Date().toString()
    });
  }

  private onUpdateClient(client: Client, data: ClientData): void {
    // TODO: update client when in game
    if (client.gameRoomId) {
      console.log('onUpdateClient -- when client in game');
      // console.log(client.info);
    } else {
      if (client.updated(data, this.getPeersUsernames(client))) {
        this.notifyJoinedClient(client, MessageOutType.UserUpdated);
        this.broadcastPeersUpdate(client);
      }
    }
  }

  private joinNewClient(client: Client, gameRoomId: string) {
    client.setJoined();
    if (!gameRoomId) {
      this.addInClients(client);
      this.notifyJoinedClient(client);
      this.broadcastPeersUpdate(client);
      return;
    }
    // TODO: join client in game
    console.log('join client in game');
    console.log(gameRoomId);
  }

  private onJoinClient(client: Client, data: ClientData): void {
    if (this.clientExists(client)) {
      client.sendErrorMessage(ErrorType.JoinedAlready);
      return;
    }
    const { username, gameRoomId, properties } = data || {};
    if (this.clientUsernameUpdated(client, username)) {
      client.properties = properties;
      this.joinNewClient(client, gameRoomId);
    }
  }

  private handleMessageForJoinedClient(client: Client, message: MessageIn): void {
    const { type, data } = message;
    if (!this.clientExists(client)) {
      client.sendErrorMessage(ErrorType.NotJoined, message);
      return;
    }

    if (this._hostBaseMessaging.has(type)) {
      this._hostBaseMessaging.get(type)(client, data || {});
    } else {
      console.log('method type not implemented');
    }
  }

  public onMessage(client: Client, message: MessageIn): void {
    const { type, data } = message;

    if (type === MessageInType.Join) {
      this.onJoinClient(client, data);
      return;
    }

    this.handleMessageForJoinedClient(client, message);
  }

}
