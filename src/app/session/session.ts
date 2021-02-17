import { UserData } from "./../interfaces/user-data.interface";
import {
  generateId,
  getArrayFromMap,
  getNowTimeStamp,
} from "../utilities/app-utils";
import { Client } from "../utilities/client";

export class Session {
  private _id: string;
  private _createdAt: string;
  private _clients: Map<string, Client> = new Map();

  constructor() {
    this.id = generateId();
    this.createdAt = getNowTimeStamp();
  }

  public set id(value: string) {
    this._id = value;
  }

  public get id(): string {
    return this._id;
  }

  public set createdAt(value: string) {
    this._createdAt = value;
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

  public get usernamesInUse(): string[] {
    return this.hasClients
      ? this.clientsList.map((client) => client.username)
      : [];
  }

  public clientExists(client: Client): boolean {
    return this.clientsMap.has(client.id);
  }

  public removeFromClients(client: Client): void {
    if (this.clientExists(client)) {
      this.clientsMap.delete(client.id);
    }
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
