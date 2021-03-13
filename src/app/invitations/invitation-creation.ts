import { InviteAndOpenRoom } from "../interfaces/game-room.interfaces";
import { Invitation } from "../interfaces/invitation.interface";
import { GameRoomSession } from "../session/session-game-room";
import { MainSession } from "../session/session-main";
import { arrayDifference, generateId } from "../utilities/app-utils";
import { Client } from "../utilities/client";

export class InvitationCreation {

  private static getRecipientsIds(client: Client, data: InviteAndOpenRoom): string[] {
    const invitationRecipients = data.recipients.filter(id => id !== client.id);
    if (!invitationRecipients.length) {
      client.noRecipiendsSpecified(data);
      return [];
    }

    return invitationRecipients;
  }

  private static getClientsToInvite(client: Client, mainSession: MainSession, recipients: string[]): Client[] {
    const clientsToInvite = mainSession.getClients(recipients);

    const connectedClients = clientsToInvite.map(connectedClient => connectedClient.id);
    const disconnectedRecipients = arrayDifference(recipients, connectedClients);

    if (disconnectedRecipients.length) {
      client.invitationRecipiendsDisconnected(disconnectedRecipients);
      return [];
    }

    return clientsToInvite;
  }

  public static getRecipientsForInvitation(client: Client, mainSession: MainSession, data: InviteAndOpenRoom): Client[] {
    const invitationRecipients = InvitationCreation.getRecipientsIds(client, data);
    if (!invitationRecipients.length) {
      return [];
    }

    return InvitationCreation.getClientsToInvite(client, mainSession, invitationRecipients);
  }

  public static createInvitation(sender: Client, gameRoom: GameRoomSession, clientsToInvite: Client[]): Invitation {
    return {
      id: generateId(),
      createdAt: new Date().toString(),
      sender: sender.details,
      game: gameRoom.details,
      recipients: clientsToInvite.map(client => client.details)
    };
  }

}
