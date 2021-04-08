
import { IdGenerator } from "../..//utils/id-generator";
import { Client } from "../client/client";
import { ClientData } from "../client/client-data.interface";
import { ClientsController } from "../controllers/clients-controller";
import { MessageOutType } from "../messages/message-types/message-out-type.enum";

export class Session {
  public id: string;
  public createdAt: string = null;
  private _ClientsController: ClientsController = new ClientsController();

  constructor() {
    this.id = IdGenerator.generate();
    this.createdAt = new Date().toString();
  }

  public get hasClients(): boolean {
    return this._ClientsController.hasClients;
  }

  public get clients(): Client[] {
    return this._ClientsController.clients;
  }

  protected get numberOfClients(): number {
    return this._ClientsController.numberOfClients;
  }

  public get clientsIds(): string[] {
    return this._ClientsController.clientsIds;
  }

  public get clientsDetails(): ClientData[] {
    return this._ClientsController.clientsDetails;
  }

  public get clientsInfo(): ClientData[] {
    return this._ClientsController.clientsInfo;
  }

  public getClientPeers(client: Client): Client[] {
    return this._ClientsController.getClientPeers(client);
  }

  public clientExists(client: Client): boolean {
    return this._ClientsController.clientExists(client);
  }

  public getPeersDetails(client: Client): ClientData[] {
    return this.getClientPeers(client).map((peer) => peer.details);
  }

  public getClientById(clientId: string): Client {
    return this._ClientsController.findClientById(clientId);
  }

  public getClientsByIds(clientIds: string[]): Client[] {
    return this._ClientsController.getClientsByIds(clientIds);
  }

  public getConnectedClientsByIds(clientIds: string[]): Client[] {
    return this._ClientsController.getClientsByIds(clientIds).filter(client => client.connected);
  }

  public removeClient(client: Client): void {
    this._ClientsController.removeClient(client);
  }

  public addClient(client: Client): void {
    this._ClientsController.addClient(client);
  }

  public getPeersUsernames(client: Client): string[] {
    return this._ClientsController.getPeersUsernames(client);
  }

  public broadcastToPeers(initiator: Client, type: MessageOutType, data: {}): void {
    const peers = this.getClientPeers(initiator);
    peers.forEach((client) => client.sendMessage(type, data));
  }

  public broadcastToClients(type: MessageOutType, data: {}): void {
    this.clients.forEach((client) => client.sendMessage(type, data));
  }

}
