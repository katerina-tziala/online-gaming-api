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
    const { errorType, ...validationData } = UsernameValidator.validate(value, usernamesInSession);
    if (errorType) {
      client.sendErrorMessage(errorType, validationData);
      return false;
    }
    client.username = validationData.value;
    return true;
  }

  private addInClients(client: Client): void {
    client.gameRoomId = null;
    this.addClient(client);
  }

  private broadcastPeersUpdate(clientToExclude: Client): void {
    const clientsToReceiveBroadcast = this.getClientPeers(clientToExclude);
    this.broadcastPeersToClients(clientsToReceiveBroadcast);
  }

  private broadcastPeersToClients(clients: Client[]): void {
    clients.forEach((client) => this.notifyUserForPeersUpdate(client));
  }

  private notifyUserForPeersUpdate(client: Client): void {
    const peers = this.getPeersDetailsOfClient(client);
    client.sendMessage(MessageOutType.Peers, { peers });
  }

  private notifyJoinedClient(client: Client, type = MessageOutType.Joined): void {
    const user = client.info;
    const peers = this.getPeersDetailsOfClient(client);
    client.sendMessage(type, { user, peers });
  }

  private joinNewClient(client: Client, gameRoomId: string) {
    if (!gameRoomId) {
      this.addInClients(client);
      this.notifyJoinedClient(client);
      this.broadcastPeersUpdate(client);
      return;
    }
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
      this.joinNewClient(client, gameRoomId);
    }
  }

  private onUpdateClient(client: Client, data: ClientData) {
    console.log("onUpdateClient");
    console.log(client.info);

  }








  public onMessage(client: Client, message: MessageIn): void {
    const { type, data } = message;
    if (this._messageConfig.has(type)) {
      this._messageConfig.get(type)(client, data);
    } else {
      console.log("method type not implemented");
    }
  }

}
