import { CONFIG } from "../../config/config";
import { Invitation } from "../interfaces/invitation.interface";
import { UserData } from "../interfaces/user-data.interface";
import { MessageOutType } from "../messages/message-types.enum";
import { Client } from "../utilities/client";
import { Session } from "./session";

export class MainSession extends Session {
  constructor() {
    super();
  }

  private usernameInData(data: UserData): boolean {
    return Object.keys(data).includes("username");
  }

  private clientUsernameInUse(client: Client, newUsername: string): boolean {
    const clientsToCheck = this.getClientPeers(client);
    const usernamesInUse = clientsToCheck.map(joinedClient => joinedClient.username);

    if (usernamesInUse.includes(newUsername)) {
      client.sendUsernameInUse();
      return true;
    }

    return false;
  }

  private getAvailableClients(): Client[] {
    return this.clientsList.filter(client => !client.gameRoomId);
  }

  private getAvailableClientsExcept(excludingClientsIds: string[] = []): Client[] {
    const availableClients = this.getAvailableClients();
    return availableClients.filter(client => !excludingClientsIds.includes(client.id));
  }

  private notifyJoinedUser(client: Client): void {
    const data = {
      user: client.userData,
      peers: this.getPeersDetailsOfClient(client)
    };
    client.notify(MessageOutType.Joined, data);
  }

  public joinClient(client: Client, data: UserData): void {
    if (!this.usernameInData(data) || !data.username.length) {
      client.sendUsernameRequired(data);
      return;
    }

    if (this.clientUsernameInUse(client, data.username)) {
      client.sendUsernameInUse();
      return;
    }

    client.update(data);
    this.addClient(client);
  }

  public addClient(client: Client): void {
    this.addInClients(client);
    client.gameRoomId = null;
    this.notifyJoinedUser(client);
    this.broadcastSession([client.id]);
  }

  public updateClient(client: Client, data: UserData): void {
    if (this.usernameInData(data) && !data.username.length) {
      client.sendUsernameRequired(data);
      return;
    }

    if (this.clientUsernameInUse(client, data.username)) {
      client.sendUsernameInUse();
      return;
    }
    client.update(data);
    client.sendUserUpdate(this.getPeersDetailsOfClient(client));
    this.broadcastSession([client.id]);
  }

  public removeClient(client: Client): void {
    this.removeFromClients(client);
    if (this.hasClients) {
      this.broadcastSession();
    }
  }

  public broadcastSession(excludingClientsIds: string[] = []): void {
    const clientsToReceiveBroadcast = this.getAvailableClientsExcept(excludingClientsIds);
    clientsToReceiveBroadcast.forEach((client) => {
      const peers = this.getPeersDetailsOfClient(client);
      client.notify(MessageOutType.Peers, {peers});
    });
  }

  public getAllInvitations(): Invitation[] {
    const invitationsOfClients = this.clientsList.map(client => client.invitations);
    return [].concat.apply([], invitationsOfClients);
  }

  public getSenderInvitations(clientId: string): Invitation[] {
    const invitationsOfClients = this.getAllInvitations();
    return invitationsOfClients.filter(invitation => invitation.sender.id === clientId);
  }

}
