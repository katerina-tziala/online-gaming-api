import { CONFIG } from "../../config/config";
import { MessageOutType } from "../messages/message-types.enum";
import { Client } from "../utilities/client";

import { Session } from "./session";

export class MainSession extends Session {
  constructor() {
    super();
    this.id = CONFIG.APP_PROTOCOL;
  }

  private notifyAddedClient(client: Client): void {
    const data = {
      user: client.details,
      peers: this.getPeersDetailsOfClient(client),
    };
    client.sendUserUpdate(data);
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

  //
  public addClient(client: Client): void {
    this.addInClients(client);
    this.notifyAddedClient(client);
    this.broadcastSession([client.id]);

    // console.log("connected clients");
    // console.log(this.clientsList.map((clienti) => clienti.details));
    // console.log(this.clientsList.map((clienti) => clienti));
  }

  public removeClient(client: Client): void {
    // console.log("removeClient from main session");
    // console.log(client);
    this.removeFromClients(client);
    // console.log("---");
    // console.log(this.clientsList.map((clienti) => clienti));

    if (this.hasClients) {
      this.broadcastSession();
    }
  }
}
