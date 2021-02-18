import { CONFIG } from "../../config/config";
import { MessageOutType } from "../messages/message-types.enum";
import { Client } from "../utilities/client";
import { Session } from "./session";

export class MainSession extends Session {
  constructor() {
    super();
  }

  private broadcastSession(excludingClientsIds: string[] = []): void {
    const clientsToReceiveBroadcast = this.clientsList.filter(
      (client) => !excludingClientsIds.includes(client.id)
    );
    clientsToReceiveBroadcast.forEach((client) => {
      const clientPeers = this.getPeersDetailsOfClient(client);
      client.sendPeersNotification(clientPeers);
    });
  }

  public addClient(client: Client): void {
    this.addInClients(client);
    client.sendUserUpdate(this.getPeersDetailsOfClient(client));
    this.broadcastSession([client.id]);
  }

  public updateClient(client: Client): void {
    client.sendUserUpdate(this.getPeersDetailsOfClient(client));
    this.broadcastSession([client.id]);
  }

  public removeClient(client: Client): void {
    this.removeFromClients(client);
    if (this.hasClients) {
      this.broadcastSession();
    }
  }
}
