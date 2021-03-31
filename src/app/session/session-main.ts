import { PrivateMessage } from "../interfaces/private-message.interface";
import {
  MessageErrorType,
  MessageOutType,
} from "../messages/message-types.enum";
import { MessageIn } from "../messages/message.interface";
import { Client } from "../utilities/client";
import { ClientUpdateData } from "./../interfaces/user-data.interface";
import { Session } from "./session";


export class MainSession extends Session {
  constructor() {
    super();
  }

  private usernameValid(username: string): boolean {
    return username.length ? new RegExp(/^(\w{4,})$/).test(username) : false;
  }

  private usernameUnique(client: Client, username: string): boolean {
    const usernamesInSession = this.getClientPeers(client).map(
      (peer) => peer.username
    );
    return !usernamesInSession.includes(username);
  }

  public notifyUser(client: Client, type = MessageOutType.Joined): void {
    const data = {
      user: client.info,
      peers: this.getPeersDetailsOfClient(client),
    };
    client.notify(type, data);
  }

  private clientUpdated(client: Client, msg: MessageIn): boolean {
    const userData: ClientUpdateData = msg.data;
    userData.username = userData.username.trim();
    if (!this.usernameValid(userData.username)) {
      client.sendError(MessageErrorType.UsernameInvalid, msg);
      return false;
    } else if (!this.usernameUnique(client, userData.username)) {
      client.sendError(MessageErrorType.UsernameInUse, msg);
      return false;
    }
    client.update(userData);
    return true;
  }

  public addInClients(client: Client): void {
    client.gameRoomId = null;
    super.addInClients(client);
  }

  public addClient(client: Client): void {
    this.addInClients(client);
    this.notifyUser(client);
    this.broadcastPeersUpdate(client);
  }

  public removeClient(client: Client): void {
    this.removeFromClients(client);
    if (this.hasClients) {
      this.broadcastPeersUpdate(client);
    }
  }

  public joinClient(client: Client, msg: MessageIn, callBack: () => void): void {
    const { username } = msg.data;
    if (!username || !username.length) {
      client.sendError(MessageErrorType.UsernameRequired, msg);
    } else if (this.clientUpdated(client, msg)) {
      this.addInClients(client);
      callBack();
    }
  }

  public onClientUpdate(client: Client, msg: MessageIn): void {
    const { username } = msg.data;
    if (username === undefined) {
      client.update(msg.data);
      this.notifyUser(client, MessageOutType.UserUpdate);
      this.broadcastPeersUpdate(client);
      return;
    } else if (this.clientUpdated(client, msg)) {
      this.notifyUser(client, MessageOutType.UserUpdate);
      this.broadcastPeersUpdate(client);
    }
  }

  public sendPrivateMessage(sender: Client, msg: MessageIn): void {
    const data: PrivateMessage = msg.data;

    if (sender.id === data.recipientId) {
      // notify sender?
      sender.sendError(MessageErrorType.MessageToSelf, msg);
      return;
    }

    const recipient = this.findClientById(data.recipientId);
    if (!recipient) {
      sender.sendError(MessageErrorType.RecipientNotConnected, msg);
      return;
    }

    const messageToSend = {
      content: data.content,
      sender: sender.info,
      deliveredAt: new Date().toString(),
    };
    recipient.notify(MessageOutType.PrivateMessage, messageToSend);
  }

  public broadcastPeersUpdate(clientToExclude: Client): void {
    const clientsToReceiveBroadcast = this.getClientPeers(clientToExclude);
    this.broadcastPeersToClients(clientsToReceiveBroadcast);
  }

  public notifyUserForPeersUpdate(client: Client): void {
    const peers = this.getPeersDetailsOfClient(client);
    client.notify(MessageOutType.Peers, { peers });
  }

  private broadcastPeersToClients(clients: Client[]): void {
    clients.forEach((client) => this.notifyUserForPeersUpdate(client));
  }

  public addMultipleClients(clients: Client[], messageType: MessageOutType): void {
    const clientsToAddIds = clients.map(client => client.id);
    clients.forEach(client => this.addInClients(client));
    // notify new clients after all are in the main session
    clients.forEach(client => this.notifyUser(client, messageType));
    const clientsToReceiveBroadcast = this.clients.filter(client => !clientsToAddIds.includes(client.id));
    this.broadcastPeersToClients(clientsToReceiveBroadcast);
  }
}
