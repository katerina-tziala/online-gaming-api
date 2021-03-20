import { ClientData } from "./../interfaces/user-data.interface";
import { generateId } from "../utilities/app-utils";
import { Client } from "../utilities/client";

export class Session {
  public id: string;
  public createdAt: string = null;
  public _clients: Map<string, Client> = new Map();

  constructor() {
    this.id = generateId();
    this.createdAt = new Date().toString();
  }

  public get hasClients(): boolean {
    return !!this._clients.size;
  }

  public get clients(): Client[] {
    return Array.from(this._clients.values());
  }
  public getClientPeers(client: Client): Client[] {
    return this.clients.filter((peer) => peer.id !== client.id);
  }

  public clientExists(client: Client): boolean {
    return this._clients.has(client.id);
  }

  public removeFromClients(client: Client): void {
    if (this.clientExists(client)) {
      this._clients.delete(client.id);
    }
  }

  public addInClients(client: Client): void {
    this.removeFromClients(client);
    this._clients.set(client.id, client);
  }

  public getPeersDetailsOfClient(client: Client): ClientData[] {
    return this.getClientPeers(client).map((peer) => peer.info);
  }

  public findClientById(clientId: string): Client {
    return this._clients.get(clientId);
  }

  public getClientsByIds(clientIds: string[]): Client[] {
    let clients = clientIds.map(id => this._clients.get(id));
    clients = clients.filter(client => !!client);
    return clients;
  }



}
