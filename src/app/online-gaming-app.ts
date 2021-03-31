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

    this._messageConfig.set(MessageInType.Join, this.onJoinClient.bind(this));
    this._messageConfig.set(MessageInType.UserInfo, this.onGetClientInfo.bind(this));
  }

  private getHost(): Host {
    return  this._host;
  }

  private messageTypeAllowed(type: string): boolean {
    return (
      this._ALLOWED_MESSAGES.includes(type) && this._messageConfig.has(type)
    );
  }

  private handleMessage(client: Client, message: MessageIn): void {
    const { type, data } = message;
    if (!type) {
      client.sendErrorMessage(ErrorType.MessageTypeExpected);
      return;
    }

    if (!this.messageTypeAllowed(type)) {
      this.sendAllowedMessagesError(client);
      return;
    }

    this._messageConfig.get(type)(client, data);
  }

  private onJoinClient(client: Client, data: ClientData): void {
    this.getHost().onJoinClient(client, data);
  }

  private onGetClientInfo(client: Client): void {
    if (client) {
      client.sendUserInfo();
    }
  }

  // CLIENT MESSAGES
  private sendAllowedMessagesError(client: Client): void {
    client.sendErrorMessage(ErrorType.MessageTypeAllowed, {
      allowedTypes: this._ALLOWED_MESSAGES,
    });
  }

  public onMessage(client: Client, messageString: string): void {
    const messageData = stringToJSON<MessageIn>(messageString);
    if (!messageData) {
      client.sendErrorMessage(ErrorType.JSONDataExcpected);
      return;
    }
    this.handleMessage(client, messageData);
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
