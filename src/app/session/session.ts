
import { IdGenerator } from "../..//utils/id-generator";
import { Client } from "../client/client";
import { ClientData } from "../client/client-data.interface";
import { MessageOutType } from "../messages/message-types/message-out-type.enum";

export class Session {
  public id: string;
  public createdAt: string = null;
  public _clients: Map<string, Client> = new Map();

  constructor() {
    this.id = IdGenerator.generate();
    this.createdAt = new Date().toString();
  }

  public get hasClients(): boolean {
    return !!this._clients.size;
  }

  public get clients(): Client[] {
    return Array.from(this._clients.values());
  }

  public get numberOfClients(): number {
    return this._clients.size;
  }

  public get clientsInfo(): ClientData[] {
    return this.clients.map((peer) => peer.info);
  }

  public getClientPeers(client: Client): Client[] {
    if (!client) {
      return this.clients;
    }
    return this.clients.filter((peer) => peer.id !== client.id);
  }

  public clientExists(client: Client): boolean {
    return this._clients.has(client.id);
  }

  public getPeersDetails(client: Client): ClientData[] {
    return this.getClientPeers(client).map((peer) => peer.info);
  }

  public findClientById(clientId: string): Client {
    return this._clients.get(clientId);
  }

  public getClientsByIds(clientIds: string[]): Client[] {
    const clients: Client[] = [];
    clientIds.forEach(clientId => {
      if (this._clients.has(clientId)) {
        clients.push(this._clients.get(clientId));
      }
    });
    return clients;
  }

  public removeClient(client: Client): void {
    if (this.clientExists(client)) {
      this._clients.delete(client.id);
    }
  }

  public addClient(client: Client): void {
    this._clients.set(client.id, client);
  }

  public getPeersUsernames(client: Client): string[] {
    return this.getClientPeers(client).map(peer => peer.username);
  }

  public notifyJoinedClient(client: Client, type = MessageOutType.Joined): void {
    const user = client.info;
    const peers = this.getPeersDetails(client);
    client.sendMessage(type, { user, peers });
  }

  public notifyClientForPeersUpdate(client: Client): void {
    const peers = this.getPeersDetails(client);
    client.sendMessage(MessageOutType.Peers, { peers });
  }

  protected broadcastToPeers(initiator: Client, type: MessageOutType, data: {}): void {
    const peers = this.getClientPeers(initiator);
    peers.forEach((client) => client.sendMessage(type, data));
  }
}
