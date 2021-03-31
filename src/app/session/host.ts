import { Session } from "./session";

import { Client } from "../client/client";
import { ClientData } from "../client/client-data.interface";
import { ErrorType } from "../error-type.enum";
import { UsernameValidator } from "../username-validator/username-validator";

export class Host extends Session {

  constructor() {
    super();

  }

  private usernameUnique(client: Client, username: string): boolean {
    const usernamesInSession = this.getClientPeers(client).map(
      (peer) => peer.username
    );
    return !usernamesInSession.includes(username);
  }


  public onJoinClient(client: Client, data: ClientData): void {
    if (this.clientExists(client)) {
      client.sendErrorMessage(ErrorType.JoinedAlready);
      return;
    }
    const { username, gameRoomId, properties } = data || {};


    console.log(client.info);
    console.log("-------");
    const usernameValidation = UsernameValidator.validate(username);

    console.log(usernameValidation);
    // console.log(data);
    // console.log(username, gameRoomId, properties);

  }

  // private clientUpdated(client: Client, msg: MessageIn): boolean {
  //   const userData: ClientUpdateData = msg.data;
  //   userData.username = userData.username.trim();
  //   if (!this.usernameValid(userData.username)) {
  //     client.sendError(MessageErrorType.UsernameInvalid, msg);
  //     return false;
  //   } else if (!this.usernameUnique(client, userData.username)) {
  //     client.sendError(MessageErrorType.UsernameInUse, msg);
  //     return false;
  //   }
  //   client.update(userData);
  //   return true;
  // }



}
