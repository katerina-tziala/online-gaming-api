import { UserData } from "./../interfaces/user-data.interface";
import { generateId, getArrayFromMap } from "../utilities/app-utils";
import { Client } from "../utilities/client";

export class Session {
  private _id: string;
  private _createdAt: string = null;
  private _clients: Map<string, Client> = new Map();

  constructor() {
    this.id = generateId();
    this.createdAt = new Date().toString();
  }

  public set id(value: string) {
    this._id = value;
  }

  public get id(): string {
    return this._id;
  }

  public set createdAt(value: string) {
    this._createdAt = value.toString();
  }

  public get createdAt(): string {
    return this._createdAt;
  }

  public get clientsMap(): Map<string, Client> {
    return this._clients;
  }

  public get hasClients(): boolean {
    return this.clientsMap && this.clientsMap.size ? true : false;
  }

  public get clientsList(): Client[] {
    return getArrayFromMap(this.clientsMap);
  }

  public clientExists(client: Client): boolean {
    return this.clientsMap.has(client.id);
  }

  public removeFromClients(client: Client): void {
    if (this.clientExists(client)) {
      this.clientsMap.delete(client.id);
    }
  }

  public getClientById(clientId: string): Client {
    return this.clientsMap.get(clientId);
  }

  public getClients(ids: string[]): Client[] {
    return this.clientsList.filter(client => ids.includes(client.id));
  }

  public addInClients(client: Client): void {
    this.removeFromClients(client);
    this.clientsMap.set(client.id, client);
  }

  public getClientPeers(client: Client): Client[] {
    return this.clientsList.filter((peer) => peer.id !== client.id);
  }

  public getPeersDetailsOfClient(client: Client): UserData[] {
    return this.getClientPeers(client).map((peer) => peer.details);
  }
}
