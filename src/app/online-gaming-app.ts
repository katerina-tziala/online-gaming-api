import { stringToJSON } from "../utils/utils";
import { Client } from "./client/client";
import { ErrorType } from "./error-type.enum";
import { MessageInType } from "./messages/message-types/message-types.enum";
import { MessageIn } from "./messages/message.interface";
import { ClientData } from "./client/client-data.interface";
import { Host } from "./session/host";

export class OnlineGamingApp {
  private _ALLOWED_MESSAGES: string[] = Object.values(MessageInType);
  private _messageConfig: Map<
    string,
    (client: Client, data?: {}) => void
  > = new Map();

  // TODO: multiple hosts
    private _host: Host;

  constructor() {

    this._host = new Host();

  }

  private getHost(): Host {
    return  this._host;
  }

  private messageTypeAllowed(type: MessageInType): boolean {
    return this._ALLOWED_MESSAGES.includes(type);
  }


  private handleMessage(client: Client, message: MessageIn): void {
    const { type } = message;
    if (type === MessageInType.UserInfo) {
      this.onGetClientInfo(client);
    } else if (type === MessageInType.Disconnect) {
      console.log("disconnect from app");
    } else {
      this.getHost().onMessage(client, message);
    }
  }

  private onGetClientInfo(client: Client): void {
    if (client) {
      client.sendUserInfo();
    }
  }

  private sendAllowedMessagesError(client: Client): void {
    client.sendErrorMessage(ErrorType.MessageTypeAllowed, {
      allowedTypes: this._ALLOWED_MESSAGES,
    });
  }

  private messageTypeValid(client: Client, type: MessageInType): boolean {
    if (!type) {
      client.sendErrorMessage(ErrorType.MessageTypeExpected);
      return false;
    }
    if (!this.messageTypeAllowed(type)) {
      this.sendAllowedMessagesError(client);
      return false;
    }
    return true;
  }

  public onMessage(client: Client, messageString: string): void {
    const messageData = stringToJSON<MessageIn>(messageString);
    if (!messageData) {
      client.sendErrorMessage(ErrorType.JSONDataExcpected);
      return;
    }
    const { type } = messageData;
    if (this.messageTypeValid(client, type)) {
      this.handleMessage(client, messageData);
    }
  }






  public disconnect(client: Client): void {
    console.log("disconnect");
    console.log(client.info);
  }
  // function disconnect(client: Client): void {
  //   if (!client) {
  //     return;
  //   }
  //   const host = getClientHost(client);
  //   host.disconnectClient(client);
  //   if (!host.hasClients) {
  //     GamingHosts.delete(host.id);
  //   }
  // }
}
