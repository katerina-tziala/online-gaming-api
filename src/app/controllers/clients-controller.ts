
import { Client } from "../client/client";
import { ClientData } from "../client/client-data.interface";

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

  public set clients(clients: Client[]) {
    this._clients = new Map();
    clients.forEach(client => this.addClient(client));
  }

  public get clientsIds(): string[] {
    return Array.from(this._clients.keys());
  }

  public get clientsDetails(): ClientData[] {
    return this.clients.map((peer) => peer.details);
  }

  public get clientsInfo(): ClientData[] {
    return this.clients.map((peer) => peer.info);
  }

  public get clientsBasicInfo(): ClientData[] {
    return this.clients.map((peer) => peer.basicInfo);
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
