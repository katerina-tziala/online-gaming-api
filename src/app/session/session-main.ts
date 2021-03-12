import { CONFIG } from "../../config/config";
import { MessageOutType } from "../messages/message-types.enum";
import { Client } from "../utilities/client";
import { Session } from "./session";

export class MainSession extends Session {
  constructor() {
    super();
  }

  public broadcastSession(excludingClientsIds: string[] = []): void {
    let clientsToReceiveBroadcast = this.clientsList.filter(
      (client) => !excludingClientsIds.includes(client.id)
    );
    clientsToReceiveBroadcast = clientsToReceiveBroadcast.filter(client => !client.gameRoomId);
    clientsToReceiveBroadcast.forEach((client) => {
      const clientPeers = this.getPeersDetailsOfClient(client);
      client.sendPeersNotification(clientPeers);
    });
  }

  public addClient(client: Client): void {
    this.addInClients(client);
    client.gameRoomId = null;
    client.sendUserJoined(this.getPeersDetailsOfClient(client));
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
