import { Session } from "./session";
import { Client } from "../client/client";
import { ClientData } from "../client/client-data.interface";
import { ErrorType } from "../error-type.enum";
import { UsernameValidator } from "../username-validator/username-validator";
import { MessageOutType, MessageInType } from "../messages/message-types/message-types.enum";
import { MessageIn } from "../messages/message.interface";

export class Host extends Session {
  private _messageConfig: Map<
    string,
    (client: Client, data?: {}) => void
  > = new Map();

  constructor() {
    super();
    this._messageConfig.set(MessageInType.Join, this.onJoinClient.bind(this));
    this._messageConfig.set(MessageInType.UserUpdate, this.onUpdateClient.bind(this));
  }

  private clientUsernameUpdated(client: Client, value: any): boolean {
    const usernamesInSession = this.getPeersUsernames(client);
    return client.usernameUpdated(value, usernamesInSession);
  }

  private addInClients(client: Client): void {
    client.gameRoomId = null;
    this.addClient(client);
  }

  private onUpdateClient(client: Client, data: ClientData) {
    // TODO: update client when in game
    if (client.gameRoomId) {
      console.log("onUpdateClient -- when client in game");
      // console.log(client.info);
    } else {
      if (client.updated(data, this.getPeersUsernames(client))) {
        this.notifyJoinedClient(client, MessageOutType.UserUpdated);
        this.broadcastPeersUpdate(client);
      }
    }
  }

  private joinNewClient(client: Client, gameRoomId: string) {
    if (!gameRoomId) {
      this.addInClients(client);
      this.notifyJoinedClient(client);
      this.broadcastPeersUpdate(client);
      return;
    }
    // TODO: join client in game
    console.log("join client in game");
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
      client.setJoined();
      this.joinNewClient(client, gameRoomId);
    }
  }

  private handleMessageForJoinedClient(client: Client, message: MessageIn): void {
    const { type, data } = message;
    if (!this.clientExists(client)) {
      client.sendErrorMessage(ErrorType.NotJoined, message);
      return;
    }

    if (this._messageConfig.has(type)) {
      this._messageConfig.get(type)(client, data || {});
    } else {
      console.log("method type not implemented");
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
