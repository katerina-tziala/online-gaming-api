
import { Client } from "../client/client";

export class ClientsController {
  private _clients: Map<string, Client> = new Map();

  public get numberOfClients(): number {
    return this._clients.size;
  }

  public get hasClients(): boolean {
    return !!this._clients.size;
  }

  public get clients(): Client[] {
    return Array.from(this._clients.values());
  }

  public set clientsMap(clients: Map<string, Client>) {
    this._clients = clients;
  }

  public get clientsIds(): string[] {
    return Array.from(this._clients.keys());
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

}
