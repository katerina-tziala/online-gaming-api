import { Invitation } from "../interfaces/invitation.interface";
import { InvitationCreation } from "./invitation-creation";
import { InvitationRejection } from "./invitation-rejection";
import { GameRoomSession } from "../session/session-game-room";
import { MainSession } from "../session/session-main";
import { Client } from "../utilities/client";


export class InvitationsController {

  public static sendInvitations(sender: Client, clientsToInvite: Client[], gameRoom: GameRoomSession): void {
    const invitation = InvitationCreation.createInvitation(sender, gameRoom, clientsToInvite);
    clientsToInvite.forEach(client => client.receiveInvitation({ ...invitation }));
  }

  public static rejectInvitation(client: Client, mainSession: MainSession, invitationId: string): void {
    const invitationToReject = client.getInvitation(invitationId);
    if (!invitationToReject) {
      return;
    }
    client.rejectInvitation(invitationToReject);

    InvitationRejection.notifySenderForRejectedInvitation(client.details, mainSession, invitationToReject);
    InvitationRejection.notifyRecipientsForRejectedInvitation(client.details, mainSession, invitationToReject);
  }

  public static rejectPendingInvitations(client: Client, mainSession: MainSession): void {
    client.invitations.forEach(invitation => {
      InvitationRejection.notifySenderForRejectedInvitation(client.details, mainSession, invitation);
      InvitationRejection.notifyRecipientsForRejectedInvitation(client.details, mainSession, invitation);
    });
  }

  public static cancelSentInvitations(client: Client, mainSession: MainSession): void {
    const invitationsSent = mainSession.getSenderInvitations(client.id);
    const uniqueInvitations =  Array.from(new Set(invitationsSent));
    uniqueInvitations.forEach(invitation => {
      this.cancelInvitation(client, invitation, mainSession);
    });
  }

  public static cancelInvitation(sender: Client, invitation: Invitation, mainSession: MainSession): void {
    const recipientsIds = invitation.recipients.map(recipient => recipient.id).filter(id => id !== sender.id);
    const recipientsToNotify = mainSession.getClients(recipientsIds);
    recipientsToNotify.forEach(recipient => {
      recipient.invitationCanceled(sender.info, {...invitation});
    });
  }

  public static handleInvitationsForDisconnectedClient(client: Client, mainSession: MainSession): void {
    InvitationsController.cancelSentInvitations(client, mainSession);
    InvitationsController.rejectPendingInvitations(client, mainSession);
  }

  public static cancelInvitationsForGame(client: Client, mainSession: MainSession, gameId: string): void {
    const invitationsSent = mainSession.getSenderInvitations(client.id);
    const invitationForGame = invitationsSent.find(invitation => invitation.game.id === gameId);
    if (!invitationForGame) {
      return;
    }
    this.cancelInvitation(client, invitationForGame, mainSession);
  }
}
