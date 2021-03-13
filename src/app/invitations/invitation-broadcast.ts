import { InviteAndOpenRoom } from "../interfaces/game-room.interfaces";
import { MessageErrorType } from "../messages/message-types.enum";
import { Client } from "../utilities/client";

export class InvitationBroadcast {

  public static noRecipiendsSpecified(client: Client, data: InviteAndOpenRoom): void {
    client.sendMessageFailed(MessageErrorType.NoRecipientsSpecified, data);
  }

  public static invitationRecipiendsDisconnected(client: Client, disconnectedRecipients: string[]): void {
    client.sendMessageFailed(MessageErrorType.RecipientsDisconnected, {disconnectedRecipients});
  }







}
