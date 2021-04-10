import { Client } from "../../client/client";
import { ClientData } from "../../client/client-data.interface";
import { GameConfig } from "../../game/game-config/game-config";
import { GameInfo, GameInvitation } from "./game.interfaces";
import { ErrorType } from "../../error-type.enum";
import {
  MessageInType,
  MessageOutType,
} from "../../messages/message-types/message-types";
import { GameRoom } from "./game-room";
import { ClientsController } from "../../controllers/clients-controller";
import { GameRequest } from "../../game/game-request/game-request";

export class GameRoomPrivate extends GameRoom {
  private _InvitationRequest: GameRequest;
  private _InvitedPlayersController: ClientsController;

  constructor(config: GameConfig, client: Client, playersToInvite: Client[]) {
    super(config);
    this.key = "private|" + this.key;
    this._InvitedPlayersController = new ClientsController();
    this._InvitationRequest = new GameRequest();
    this.onOpen(client, playersToInvite);
  }

  private get gameInvitation(): GameInvitation {
    const request = this._InvitationRequest.request;
    if (!request) {
      return;
    }
    return {
      requestedAt: request.requestedAt,
      requestedBy: request.requestedBy,
      status: request.status,
      confirmedBy: request.confirmedBy,
      pendingResponse: this.getIvitedClientsInfo(request.pendingResponse),
      rejectedBy: this.getIvitedClientsInfo(request.rejectedBy),
      game: this.details,
    };
  }

  public get details(): GameInfo {
    const details = super.details;
    details.playersExpected = this.getIvitedClientsInfo(this._InvitationRequest.pendingResponse);
    details.rejectedBy = this.getIvitedClientsInfo(this._InvitationRequest.rejectedBy);
    return details;
  }

  private getIvitedClientsInfo(clientsIds: string[]): ClientData[] {
    const invitedClients = this._InvitedPlayersController.getClientsByIds(
      clientsIds
    );
    return invitedClients.map((client) => client.details);
  }

  private clientHasAccess(client: Client): boolean {
    return this._InvitationRequest.clientInvolvedInRequest(client.id);
  }

  private clientExpected(client: Client): boolean {
    return this.clientHasAccess(client) && !this.clientExists(client);
  }

  private onOpen(client: Client, playersToInvite: Client[]): void {
    this._InvitedPlayersController.clients = playersToInvite;
    this.joinPlayer(client);
    this._InvitationRequest.createRequest(
      client.id,
      this._InvitedPlayersController.clientsIds
    );
    this.broadcastGameInvitations();
  }

  // private clientAllowedToJoin(client: Client): boolean {
  //   return this.clientExpected(client) && !this._InvitationRequest.rejectedBy.length;
  // }

  // private checkFailedClientToJoin(client: Client): void {
  //   if (!this.clientHasAccess(client)) {
  //     this.sendAccessError(client, MessageInType.GameInvitationAccept);
  //   } else if(this.clientExists(client)) {
  //     this.onInvitationAcceptFromJoinedClient(client);
  //   } else {
  //     // TODO:
  //     console.log("client has access, is not in game yet, trying to accept");
  //     console.log("maybe rejected?");
  //   }
  // }

  // private onInvitationAcceptFromJoinedClient(client: Client): void {
  //   if (this.filled) {
  //     this.sendForbiddenActionError(client, MessageInType.GameInvitationAccept);
  //   } else {
  //     client.sendErrorMessage(ErrorType.WaitForPlayers, this.gameInvitation);
  //   }
  // }

  public joinClient(client: Client): boolean {
    if (!this.clientHasAccess(client)) {
      this.sendAccessError(client, MessageInType.GameInvitationAccept);
      return false;
    }

    if(this._InvitationRequest.clientPendingResponse(client.id)) {
      this.acceptInvitatioWhenPendingRequest(client);
    } else {
      this.acceptInvitationWhenNoPendingResponse(client);
    }
    // if (this.clientAllowedToJoin(client)) {
    //   this._InvitationRequest.confirmRequest(client.id);
    //   this.addPlayer(client);
    //   this.broadcastToClientsPendingResponse(MessageOutType.GameInvitationAccepted);
    //   return true;
    // }
    // this.checkFailedClientToJoin(client);
    return false;
  }
  private acceptInvitatioWhenPendingRequest(client: Client) {
    console.log("acceptInvitatioWhenPendingRequest - what is the status of the rest?");
    // this.clearStartTimeout();
    // this._InvitationRequest.rejectRequest(client.id);
    // this.broadcastInvitationRejected();
  }

  private acceptInvitationWhenNoPendingResponse(client: Client) {
    console.log("accept InvitationWhenNoPendingResponse");
    // if client accepted then we need to set client back in main session
  }
  // protected get filled(): boolean {
  //   return super.filled && this._InvitationRequest.requestConfirmed;
  // }

  public onRejectInvitation(client: Client): void {
    if (!this.clientHasAccess(client)) {
      this.sendAccessError(client, MessageInType.GameInvitationReject);
    } else if(this._InvitationRequest.clientPendingResponse(client.id)) {
      this.rejectInvitationWhenPendingRequest(client);
    } else {
      this.rejectInvitationWhenNoPendingResponse(client);
    }
  }

  private rejectInvitationWhenPendingRequest(client: Client) {
    console.log("rejectInvitationWhenPendingRequest - what is the status of the rest?");
    // this.clearStartTimeout();
    // this._InvitationRequest.rejectRequest(client.id);
    // this.broadcastInvitationRejected();
  }

  private rejectInvitationWhenNoPendingResponse(client: Client) {
    console.log("rejectInvitationWhenNoPendingResponse");
    // if client accepted then we need to set client back in main session
  }

  // MESSAGE BROADCAST
  private broadcastGameInvitations(): void {
    this._InvitedPlayersController.clients.forEach((client) => {
      client.sendMessage(MessageOutType.GameInvitation, this.gameInvitation);
    });
  }

 private broadcastToClientsPendingResponse(type: MessageOutType): void {
    const clientsToNotify = this._InvitedPlayersController.getClientsByIds(this._InvitationRequest.pendingResponse);
    clientsToNotify.forEach(player => {
      player.sendMessage(type, this.gameInvitation);
    });
  }

  private sendAccessError(client: Client, type: MessageInType): void {
    client.sendErrorMessage(ErrorType.GameAccessForbidden, { type, game: this.info });
  }

  private sendForbiddenActionError(client: Client, type: MessageInType): void {
    client.sendErrorMessage(ErrorType.GameActionForbidden, { type });
  }

 private broadcastInvitationRejected(): void {
    this.broadcastToClients(MessageOutType.GameInvitationRejected, this.gameInvitation);
    this.broadcastToClientsPendingResponse(MessageOutType.GameInvitationRejected);
  }




  // private get expectedPlayersInfo(): ClientData[] {
  //   return this._InvitedPlayersController ? this._InvitedPlayersController.clientsInfo : undefined;
  // }



  // public playerInvited(client: Client): boolean {
  //   return this._InvitedPlayersController.clientExists(client);
  // }

  // private get rejectedBy(): ClientData[] {
  //   return this._PlayersRejectedController.clientsDetails;
  // }

  // private playerRejectedGame(client: Client): boolean {
  //   return this._PlayersRejectedController.clientExists(client);
  // }

  // private get playersIdsRejectedInvitation(): string[] {
  //   return this._PlayersRejectedController.clientsIds;
  // }

  // public getExpectedPlayers(client: Client): Client[] {
  //   return this._InvitedPlayersController.getClientPeers(client);
  // }

  // public isCreator(client: Client): boolean {
  //   return client.id === this._creator?.id;
  // }

  // private getClientsForInvitationResponse(client: Client): Client[] {
  //   const peersInGame = this.getClientPeers(client);
  //   const clientsWaitingResponse = this.getClientsPendingInvitationResponse(client);
  //   return peersInGame.concat(clientsWaitingResponse);
  // }

  // private getClientsPendingInvitationResponse(client: Client): Client[] {
  //   const playersIdsToExclude = this.playersIdsRejectedInvitation;
  //   let clientsToNotify = this.getExpectedPlayers(client);
  //   clientsToNotify = clientsToNotify.filter(clientToNotify => !playersIdsToExclude.includes(clientToNotify.id));
  //   return clientsToNotify;
  // }

  // private clientHasAccess(client: Client): boolean {
  //   return this.isCreator(client) || this.playerInvited(client);
  // }

  // private clientExpected(client: Client): boolean {
  //   return this.playerInvited(client) && !this.clientExists(client);
  // }


  // private clientAllowedToRejectInvitation(client: Client): boolean {
  //   return this.clientExpected(client) && !this.playerRejectedGame(client);
  // }



  // public onPlayerLeft(client: Client): void {
  //   this.removePlayer(client);
  //   this._PlayersRejectedController.removeClient(client);
  //   if (this.isCreator(client) && this.numberOfClients === 0) {
  //     this.broadcastInvitationCanceled(client);
  //   }
  //   this.broadcastPlayerInOut(client, MessageOutType.PlayerLeft);
  // }

  // private broadcastInvitationRejected(client: Client): void {
  //   const invitation = this.inviatationData;
  //   const sender = client.info;
  //   const clientsToNotify = this.getClientsForInvitationResponse(client);
  //   clientsToNotify.forEach(player => {
  //     player.sendMessage(MessageOutType.GameInvitationRejected, { sender, invitation });
  //   });
  // }

  // private broadcastInvitationCanceled(client: Client): void {
  //   const clientsToNotify = this.getClientsPendingInvitationResponse(client);
  //   clientsToNotify.forEach(player => {
  //     player.sendMessage(MessageOutType.GameInvitationCanceled, this.inviatationData);
  //   });
  // }
}
