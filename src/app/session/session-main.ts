import { CONFIG } from "../../config/config";
import { Invitation } from "../interfaces/invitation.interface";
import { ClientUpdateData, UserData } from "../interfaces/user-data.interface";
import { MessageOutType } from "../messages/message-types.enum";
import { Client } from "../utilities/client";
import { Session } from "./session";

export class MainSession extends Session {
  constructor() {
    super();
  }

  private getAvailablePeers(client: Client): Client[] {
    const peers = this.getClientPeers(client);
    return peers.filter((peer) => !peer.gameRoomId);
  }

  private notifyUser(client: Client, type: MessageOutType): void {
    const data = {
      user: client.info,
      peers: this.getPeersDetailsOfClient(client),
    };
    client.notify(type, data);
  }

  private broadcastPeersUpdate(joinedClient: Client): void {
    const clientsToReceiveBroadcast = this.getAvailablePeers(joinedClient);
    clientsToReceiveBroadcast.forEach((client) => {
      const peers = this.getPeersDetailsOfClient(client);
      client.notify(MessageOutType.Peers, { peers });
    });
  }

  public addClient(client: Client): void {
    client.gameRoomId = null;
    this.addInClients(client);
    this.notifyUser(client, MessageOutType.Joined);
    this.broadcastPeersUpdate(client);
  }

  public broadcastUpdatedClient(client: Client): void {
    this.notifyUser(client, MessageOutType.UserUpdate);
    this.broadcastPeersUpdate(client);
  }

  public removeClient(client: Client): void {
    this.removeFromClients(client);
    if (this.hasClients) {
      this.broadcastPeersUpdate(client);
    }
  }


  // public getAllInvitations(): Invitation[] {
  //   const invitationsOfClients = this.clientsList.map(client => client.invitations);
  //   return [].concat.apply([], invitationsOfClients);
  // }

  // public getSenderInvitations(clientId: string): Invitation[] {
  //   const invitationsOfClients = this.getAllInvitations();
  //   return invitationsOfClients.filter(invitation => invitation.sender.id === clientId);
  // }
}
