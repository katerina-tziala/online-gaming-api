import { stringToJSON } from "../utils/utils";
import { Client } from "./client/client";
import { ErrorType } from "./error-type.enum";
import { MessageInType } from "./messages/message-types/message-types.enum";
import { MessageIn } from "./messages/message.interface";
import { ClientData } from "./client/client-data.interface";
import { Host } from "./session/host";

export class OnlineGamingApp {
  private _ALLOWED_MESSAGES: string[] = Object.values(MessageInType);
  private _messageConfig: Map<string, (client: Client, data?: {}) => void> = new Map();

  // TODO: multiple hosts
  private _host: Host;

  constructor() {
    this._host = new Host();
  }

  private getClientHost(): Host {
    return this._host;
  }

  private messageTypeAllowed(type: MessageInType): boolean {
    return this._ALLOWED_MESSAGES.includes(type);
  }

  private handleMessage(client: Client, message: MessageIn): void {
    const { type } = message;
    if (type === MessageInType.UserInfo) {
      this.onGetClientInfo(client);
    } else {
      this.getClientHost().onMessage(client, message);
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

  private checkMessageTypeAndHandle(client: Client, message: MessageIn): void {
    const { type } = message;
    if (!type) {
      client.sendErrorMessage(ErrorType.MessageTypeExpected);
    } else if(!this.messageTypeAllowed(type)) {
      this.sendAllowedMessagesError(client);
    } else {
      this.handleMessage(client, message);
    }
  }

  public onMessage(client: Client, messageString: string): void {
    const messageData = stringToJSON<MessageIn>(messageString);
    if (!messageData) {
      client.sendErrorMessage(ErrorType.JSONDataExcpected);
      return;
    }
    this.checkMessageTypeAndHandle(client, messageData);
  }

  public disconnect(client: Client): void {
    if (!client) {
      return;
    }
    const host = this.getClientHost();
    host.disconnectClient(client);
    if (!host.hasClients) {
      // TODO:
      console.log("when multiple remove host");
    }
  }
}
