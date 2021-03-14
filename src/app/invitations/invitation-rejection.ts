import { Invitation } from "../interfaces/invitation.interface";
import { UserInfo } from "../interfaces/user-data.interface";
import { MainSession } from "../session/session-main";

export class InvitationRejection {
  public static notifySenderForRejectedInvitation(client: UserInfo, mainSession: MainSession, invitation: Invitation) {
    const sender = mainSession.getClientById(invitation.sender.id);
    if (!sender) {
      return;
    }
    if (sender.gameRoomId === invitation.game.id) {
      mainSession.addClient(sender);
    }
    sender.invitationDenied(client, invitation);
  }

  private static getInvitationRecipientsToNotify(recipiendsToExclude: string[], invitation: Invitation) {
    const recipientsIds = invitation.recipients.map(recipient => recipient.id);
   return recipientsIds.filter(id => !recipiendsToExclude.includes(id));
  }

  public static notifyRecipientsForRejectedInvitation(clientRejectedInvitation: UserInfo, mainSession: MainSession, invitation: Invitation) {
    const recipiendsToExclude = [invitation.sender.id, clientRejectedInvitation.id];
    const recipiendsToNotify = InvitationRejection.getInvitationRecipientsToNotify(recipiendsToExclude, invitation);
    const clientsToNotify = mainSession.getClients(recipiendsToNotify);
    clientsToNotify.forEach(client => {
      if (client.gameRoomId === invitation.game.id) {
        mainSession.addClient(client);
        client.invitationDenied(clientRejectedInvitation, invitation);
      } else {
        client.invitationCanceled(clientRejectedInvitation, invitation);
      }
    });
  }
}
