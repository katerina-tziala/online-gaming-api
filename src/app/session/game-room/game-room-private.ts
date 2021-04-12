import { Client } from '../../client/client';
import { ClientData } from '../../client/client-data.interface';
import { GameConfig } from '../../game/game-config/game-config';
import { GameRoomInfo } from './game.interfaces';
import { ErrorType } from '../../error-type.enum';
import {
  MessageInType,
  MessageOutType,
} from '../../messages/message-types/message-types';
import { GameRoom } from './game-room';
import { ClientsController } from '../../controllers/clients-controller';
import { GameRequest } from '../../game/game-request/game-request';

export class GameRoomPrivate extends GameRoom {
  private _InvitationRequest: GameRequest;
  private _InvitedPlayersController: ClientsController;
  private _createdBy: ClientData;

  constructor(config: GameConfig, client: Client, playersToInvite: Client[]) {
    super(config);
    this.key = 'private|' + this.key;
    this._InvitedPlayersController = new ClientsController();
    this._InvitationRequest = new GameRequest();
    this.onOpen(client, playersToInvite);
  }

  public get info(): GameRoomInfo {
    const request = this._InvitationRequest.request;
    if (!request) {
      return super.info;
    }
    return {
      ...super.info,
      createdBy: this._createdBy,
      status: request.status,
      confirmedBy: this.getInvitedClientsInfo(request.confirmedBy),
      pendingResponse: this.getInvitedClientsInfo(request.pendingResponse),
      rejectedBy: this.getInvitedClientsInfo(request.rejectedBy),
    };
  }

  private getInvitedClientsInfo(clientsIds: string[]): ClientData[] {
    const invitedClients = this._InvitedPlayersController.getClientsByIds(
      clientsIds
    );
    return invitedClients.map((client) => client.details);
  }

  private onOpen(client: Client, playersToInvite: Client[]): void {
    this._InvitedPlayersController.clients = playersToInvite;
    this._createdBy = client.details;
    this._InvitationRequest.createRequest(client.id, this._InvitedPlayersController.clientsIds);
    this.joinPlayer(client);
    this.broadcastGameInvitations();
  }

  public clientHasAccess(client: Client): boolean {
    return this._InvitationRequest.clientInvolvedInRequest(client.id);
  }

  public clientExpected(client: Client): boolean {
    return this.clientHasAccess(client) && !this.clientExists(client);
  }

  public clientPendingInvitation(clientId: string): boolean {
    return this._InvitationRequest.clientInvolvedInRequest(clientId);
  }

  private checkFailedClientToJoin(client: Client): void {
    if (!this.clientHasAccess(client)) {
      this.sendAccessError(client, MessageInType.GameInvitationAccept);
    } else if(this.clientExists(client)) {
      this.onInvitationAcceptFromJoinedClient(client);
    }
  }
  private onInvitationAcceptFromJoinedClient(client: Client): void {
    if (this.allPlayersJoined) {
      this.sendForbiddenActionError(client, MessageInType.GameInvitationAccept);
    } else {
      client.sendErrorMessage(ErrorType.WaitForPlayers, { messageType: MessageInType.GameInvitationAccept, game: this.details });
    }
  }

  public joinClient(client: Client): boolean {
    if (this.clientExpected(client)) {
      this._InvitationRequest.confirmRequest(client.id);
      this.addPlayer(client);
      this.broadcastAcceptedInvitation();
      return true;
    }
    this.checkFailedClientToJoin(client);
    return false;
  }

  public onRejectInvitation(client: Client): void {
    if (!this.clientHasAccess(client)) {
      this.sendAccessError(client, MessageInType.GameInvitationReject);
    } else if (!this._InvitationRequest.clientPendingResponse(client.id)) {
      this.sendForbiddenActionError(client, MessageInType.GameInvitationAccept);
    } else {
      this.rejectInvitation(client);
    }
  }

  private rejectInvitation(client: Client): void {
    this.clearStartTimeout();
    this._InvitationRequest.rejectRequest(client.id);
    this.broadcastInvitationRejected();
  }

  // MESSAGE BROADCAST
  private broadcastGameInvitations(): void {
    this._InvitedPlayersController.clients.forEach((client) => {
      client.sendMessage(MessageOutType.GameInvitation, this.info);
    });
  }

  private sendAccessError(client: Client, type: MessageInType): void {
    client.sendErrorMessage(ErrorType.GameAccessForbidden, { type, game: super.info });
  }

  private sendForbiddenActionError(client: Client, type: MessageInType): void {
    client.sendErrorMessage(ErrorType.GameActionForbidden, { type, game: this.details });
  }

  private broadcastInvitationState(clientsToNotify: Client[], type: MessageOutType): void {
    clientsToNotify.forEach(player => player.sendMessage(type, this.info));
  }

  private broadcastAcceptedInvitation(): void {
    const clientsIds: string[] = [...this._InvitationRequest.pendingResponse, ...this._InvitationRequest.rejectedBy];
    const clientsToNotify = this._InvitedPlayersController.getClientsByIds(clientsIds);
    this.broadcastInvitationState(clientsToNotify, MessageOutType.GameInvitationAccepted);
  }

  private broadcastInvitationRejected(): void {
    const clientsIds: string[] = [...this._InvitationRequest.pendingResponse, ...this._InvitationRequest.rejectedBy];
    let clientsToNotify = this._InvitedPlayersController.getClientsByIds(clientsIds);
    clientsToNotify = clientsToNotify.concat(this.clients);
    this.broadcastInvitationState(clientsToNotify, MessageOutType.GameInvitationRejected);
  }

  public onPlayerLeft(client: Client): void {
    if (this._InvitationRequest.requestConfirmed) {
      this._InvitationRequest.setPendingResponse(client.id);
      super.onPlayerLeft(client);
    } else {
      this.onPlayerLeftWhenRequestNotConfirmed(client);
    }
  }

  private onPlayerLeftWhenRequestNotConfirmed(client: Client): void {
    this.removePlayer(client);
    if (this._InvitationRequest.requestCreator(client.id) && this.numberOfClients === 0) {
      this.broadcastInvitationCanceled();
    } else {
      this._InvitationRequest.setPendingResponse(client.id);
      const clientsToNotify = this._InvitedPlayersController.getClientsByIds(this._InvitationRequest.receivedRequest);
      this.broadcastInvitationState(clientsToNotify, MessageOutType.PlayerLeft);
    }
    this.broadcastPlayerInOut(client, MessageOutType.PlayerLeft);
  }

  private broadcastInvitationCanceled(): void {
    const clientsToNotify = this._InvitedPlayersController.getClientsByIds(this._InvitationRequest.pendingResponse);
    this.broadcastInvitationState(clientsToNotify, MessageOutType.GameInvitationCanceled);
  }
}
