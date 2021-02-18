import * as WebSocket from "ws";

import { UserData } from "../interfaces/user-data.interface";
import { MessageOutType } from "../messages/message-types.enum";
import { MessageOut } from "../messages/message.interface";
import { MainSession } from "../session/session-main";
import { generateId } from "./app-utils";
import { Client } from "./client";

export class GamingHost {
  public id: string;
  private _MainSession: MainSession;

  constructor(id: string) {
    this.id = id;
  }

  set mainSession(session: MainSession) {
    this._MainSession = session;
  }

  get mainSession(): MainSession {
    if (!this._MainSession) {
      this.mainSession = new MainSession();
    }
    return this._MainSession;
  }

  private clientJoined(client: Client): boolean {
    if (!this._MainSession) {
      return false;
    }
    return this._MainSession.clientExists(client);
  }

  private usernameInData(data: UserData): boolean {
    return Object.keys(data).includes("username");
  }

  private clientUsernameInUse(client: Client, newUsername: string): boolean {
    let clientsToCheck = this.mainSession.clientsList;
    clientsToCheck = clientsToCheck.filter(
      (joinedClient) => joinedClient.id !== client.id
    );

    const usernamesInUse = clientsToCheck.map(
      (joinedClient) => joinedClient.username
    );

    if (usernamesInUse.includes(newUsername)) {
      client.sendUsernameInUse();
      return true;
    }
    return false;
  }

  private checkSenderAndGetRecipient(sender: Client, data: any): Client {
    if (!this.clientJoined(sender)) {
      sender.sendUsernameRequired(data);
      return;
    }
    const recipient = this.mainSession.getClientById(data.recipientId);
    if (!recipient) {
      sender.sendRecipientNotConnected(data);
    }
    return recipient;
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
    delete data.id;
    client.update(data);
    this.mainSession.addClient(client);
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

    delete data.id;
    client.update(data);
    this.mainSession.updateClient(client);
  }

  public sendPrivateMessage(sender: Client, data: any): void {
    const recipient = this.checkSenderAndGetRecipient(sender, data);
    if (recipient) {
      const messageOut = {
        sender: sender.details,
        message: data.message
      };
      recipient.sendPrivateMessage(messageOut);
    }
  }

  public removeClient(client: Client): boolean {
    // TODO: terminate games
    // TODO:  handle invitations
    if (!client) {
      console.log("no client to remove");
      return false;
    }

    this.mainSession.removeClient(client);
    return !this.mainSession.hasClients;
  }




}
