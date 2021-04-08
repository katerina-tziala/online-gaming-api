import { Client } from "../../client/client";
import { ClientData } from "../../client/client-data.interface";
import { GameConfig } from "../../game/game-config/game-config";
import { GameInfo, GameInvitation } from "./game.interfaces";
import { ErrorType } from "../../error-type.enum";
import { MessageInType, MessageOutType } from "../../messages/message-types/message-types.enum";
import { GameRoom } from "./game-room";
import { ClientsController } from "../../controllers/clients-controller";

export class GameRoomPrivate extends GameRoom {
  private _InvitedPlayersController: ClientsController;
  private _creator: Client;
  private _PlayersRejectedController: ClientsController;

  constructor(config: GameConfig, client: Client, playersToInvite: Client[]) {
    super(config);
    this.key = "private|" + this.key;
    this._InvitedPlayersController = new ClientsController();
    this._PlayersRejectedController = new ClientsController();
    this.onOpen(client, playersToInvite);
  }

  private get expectedPlayersInfo(): ClientData[] {
    return this._InvitedPlayersController ? this._InvitedPlayersController.clientsInfo : undefined;
  }

  private get inviatationData(): GameInvitation {
    return {
      creator: this._creator.id,
      game: this.details
    };
  }

  public get details(): GameInfo {
    const details = super.details;
    details.playersExpected = this.expectedPlayersInfo;
    details.rejectedBy = this.rejectedBy;
    return details;
  }

  public playerInvited(client: Client): boolean {
    return this._InvitedPlayersController.clientExists(client);
  }

  private get rejectedBy(): ClientData[] {
    return this._PlayersRejectedController.clientsDetails;
  }

  private playerRejectedGame(client: Client): boolean {
    return this._PlayersRejectedController.clientExists(client);
  }

  private get playersIdsRejectedInvitation(): string[] {
    return this._PlayersRejectedController.clientsIds;
  }

  public getExpectedPlayers(client: Client): Client[] {
    return this._InvitedPlayersController.getClientPeers(client);
  }

  public isCreator(client: Client): boolean {
    return client.id === this._creator?.id;
  }

  private getClientsForInvitationResponse(client: Client): Client[] {
    const peersInGame = this.getClientPeers(client);
    const clientsWaitingResponse = this.getClientsPendingInvitationResponse(client);
    return peersInGame.concat(clientsWaitingResponse);
  }

  private getClientsPendingInvitationResponse(client: Client): Client[] {
    const playersIdsToExclude = this.playersIdsRejectedInvitation;
    let clientsToNotify = this.getExpectedPlayers(client);
    clientsToNotify = clientsToNotify.filter(clientToNotify => !playersIdsToExclude.includes(clientToNotify.id));
    return clientsToNotify;
  }

  private onOpen(client: Client, playersToInvite: Client[]): void {
    this._creator = client;
    this._InvitedPlayersController.clients = playersToInvite;
    this.addPlayer(client);
    this.broadcastRoomInvitations(client);
  }

  private clientHasAccess(client: Client): boolean {
    return this.isCreator(client) || this.playerInvited(client);
  }

  private clientExpected(client: Client): boolean {
    return this.playerInvited(client) && !this.clientExists(client);
  }

  public joinClient(client: Client): void {
    if (this.invitationAcceptanceAllowed(client)) {
      this._PlayersRejectedController.removeClient(client);
      this.addPlayer(client);
    }
  }

  private invitationAcceptanceAllowed(client: Client) {
    if (this.clientExpected(client)) {
      return true;
    }
    this.onInvitationAcceptanceForbidden(client);
    return false;
  }

  private onInvitationAcceptanceForbidden(client: Client): void {
    if (!this.clientHasAccess(client)) {
      client.sendErrorMessage(ErrorType.GameAccessForbidden, this.info);
    } else {
      this.onInvitationAcceptFromJoinedClient(client);
    }
  }

  private onInvitationAcceptFromJoinedClient(client: Client): void {
    if (this.filled) {
      this.notifyPlayerForForbiddenAction(client, MessageInType.GameInvitationAccept);
    } else {
      client.sendErrorMessage(ErrorType.WaitForPlayers, this.inviatationData);
    }
  }


  private clientAllowedToRejectInvitation(client: Client): boolean {
    return this.clientExpected(client) && !this.playerRejectedGame(client);
  }

  public onRejectInvitation(client: Client): void {
    if (!this.clientHasAccess(client)) {
      client.sendErrorMessage(ErrorType.GameAccessForbidden, this.info);
      return;
    }
    if (!this.clientAllowedToRejectInvitation(client)) {
      this.notifyPlayerForForbiddenAction(client, MessageInType.GameInvitationReject);
      return;
    }
    this.clearStartTimeout();
    this._PlayersRejectedController.addClient(client);
    this.broadcastInvitationRejected(client);
  }

  public onPlayerLeft(client: Client): void {
    this.removePlayer(client);
    this._PlayersRejectedController.removeClient(client);
    if (this.isCreator(client) && this.numberOfClients === 0) {
      this.broadcastInvitationCanceled(client);
    }
    this.broadcastPlayerInOut(client, MessageOutType.PlayerLeft);
  }

  // MESSAGE BROADCAST
  private broadcastRoomInvitations(client: Client): void {
    const data = this.inviatationData;
    this.getExpectedPlayers(client).forEach(expectedPlayer => {
      expectedPlayer.sendMessage(MessageOutType.GameInvitation, data);
    });
  }

  private notifyPlayerForForbiddenAction(client: Client, type: MessageInType): void {
    client.sendErrorMessage(ErrorType.GameActionForbidden, { type });
  }

  private broadcastInvitationRejected(client: Client): void {
    const invitation = this.inviatationData;
    const sender = client.info;
    const clientsToNotify = this.getClientsForInvitationResponse(client);
    clientsToNotify.forEach(player => {
      player.sendMessage(MessageOutType.GameInvitationRejected, { sender, invitation });
    });
  }

  private broadcastInvitationCanceled(client: Client): void {
    const clientsToNotify = this.getClientsPendingInvitationResponse(client);
    clientsToNotify.forEach(player => {
      player.sendMessage(MessageOutType.GameInvitationCanceled, this.inviatationData);
    });
  }
}
