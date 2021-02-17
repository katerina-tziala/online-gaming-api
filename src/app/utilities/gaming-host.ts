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

  public joinClient(client: Client, data: UserData) {
    const usernamesInUse = this.mainSession.usernamesInUse;
    client.update(data);
    if (usernamesInUse.includes(client.username)) {
      client.sendUsernameInUse();
      return;
    }
    this.mainSession.addClient(client);
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
