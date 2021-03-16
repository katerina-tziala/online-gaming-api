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

  private notifyJoinedUser(client: Client): void {
    const data = {
      user: client.info,
      peers: this.getPeersDetailsOfClient(client),
    };
    client.notify(MessageOutType.Joined, data);
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
    this.notifyJoinedUser(client);
    this.broadcastPeersUpdate(client);
  }

  public broadcastUpdatedClient(client: Client): void {
    this.notifyJoinedUser(client);
    this.broadcastPeersUpdate(client);
  }

  // public joinClient(client: Client, data: ClientUpdateData): void {
  //   // if (!this.usernameInData(data) || !data.username.length) {
  //   //   client.sendUsernameRequired(data);
  //   //   return;
  //   // }
  //   // ^\w{4,}$
  //   const { username, properties } = data;
  //   console.log(client, data);
  //   // if (this.clientUsernameInUse(client, data.username)) {
  //   //   client.sendUsernameInUse();
  //   //   return;
  //   // }

  //   // client.update(data);
  //   // this.addClient(client);
  // }

  // private getAvailableClientsExcept(excludingClientsIds: string[] = []): Client[] {
  //   const availableClients = this.getAvailableClients();
  //   return availableClients.filter(client => !excludingClientsIds.includes(client.id));
  // }

  // public joinClient(client: Client, data: UserData): void {
  //   if (!this.usernameInData(data) || !data.username.length) {
  //     client.sendUsernameRequired(data);
  //     return;
  //   }

  //   if (this.clientUsernameInUse(client, data.username)) {
  //     client.sendUsernameInUse();
  //     return;
  //   }

  //   client.update(data);
  //   this.addClient(client);
  // }

  // public addClient(client: Client): void {
  //   this.addInClients(client);
  //   client.gameRoomId = null;
  //   this.notifyJoinedUser(client);
  //   this.broadcastSession([client.id]);
  // }

  // public updateClient(client: Client, data: UserData): void {
  //   if (this.usernameInData(data) && !data.username.length) {
  //     client.sendUsernameRequired(data);
  //     return;
  //   }

  //   if (this.clientUsernameInUse(client, data.username)) {
  //     client.sendUsernameInUse();
  //     return;
  //   }
  //   client.update(data);
  //   client.sendUserUpdate(this.getPeersDetailsOfClient(client));
  //   this.broadcastSession([client.id]);
  // }

  // public removeClient(client: Client): void {
  //   this.removeFromClients(client);
  //   if (this.hasClients) {
  //     this.broadcastSession();
  //   }
  // }

  // public broadcastSession(excludingClientsIds: string[] = []): void {
  //   const clientsToReceiveBroadcast = this.getAvailableClientsExcept(excludingClientsIds);
  //   clientsToReceiveBroadcast.forEach((client) => {
  //     const peers = this.getPeersDetailsOfClient(client);
  //     client.notify(MessageOutType.Peers, {peers});
  //   });
  // }

  // public getAllInvitations(): Invitation[] {
  //   const invitationsOfClients = this.clientsList.map(client => client.invitations);
  //   return [].concat.apply([], invitationsOfClients);
  // }

  // public getSenderInvitations(clientId: string): Invitation[] {
  //   const invitationsOfClients = this.getAllInvitations();
  //   return invitationsOfClients.filter(invitation => invitation.sender.id === clientId);
  // }
}
