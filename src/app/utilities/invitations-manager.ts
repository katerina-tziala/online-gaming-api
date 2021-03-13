import * as WebSocket from "ws";
import { GameConfig, InviteAndOpenRoom } from "../interfaces/game-room.interfaces";
import { Invitation } from "../interfaces/invitation.interface";

import { UserData } from "../interfaces/user-data.interface";
import { InvitationBroadcast } from "../invitations/invitation-broadcast";
import { InvitationCreation } from "../invitations/invitation-creation";
import { InvitationRejection } from "../invitations/invitation-rejection";
import {
  MessageErrorType,
  MessageOutType,
} from "../messages/message-types.enum";
import { MessageOut } from "../messages/message.interface";
import { GameRoomSession } from "../session/session-game-room";
import { MainSession } from "../session/session-main";
import { arrayDifference, generateId, getNowTimeStamp } from "./app-utils";
import { Client } from "./client";

export class InvitationsController {

  public static sendInvitations(sender: Client, clientsToInvite: Client[], gameRoom: GameRoomSession): void {
    const invitation = InvitationCreation.createInvitation(sender, gameRoom, clientsToInvite);
    clientsToInvite.forEach(client => client.sendInvitation({ ...invitation }));
  }

  public static rejectInvitation(client: Client, mainSession: MainSession, invitationId: string): void {
    const invitationToReject = client.geReceivedInvitation(invitationId);
    if (!invitationToReject) {
      return;
    }
    client.rejectInvitation(invitationToReject);
    console.log(invitationToReject);

    InvitationRejection.notifySenderForRejectedInvitation(client, mainSession, invitationToReject);
    InvitationRejection.notifyRecipientsForRejectedInvitation(client, mainSession, invitationToReject);
  }

}
