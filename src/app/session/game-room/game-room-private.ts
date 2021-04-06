import { Client } from "../../client/client";
import { ClientData } from "../../client/client-data.interface";
import { GameConfig } from "./game-config/game-config";
import { GameInfo, GameInvitation } from "./game.interfaces";
import { ErrorType } from "../../error-type.enum";
import { MessageInType, MessageOutType } from "../../messages/message-types/message-types.enum";
import { GameRoom } from "./game-room";
import { ClientsController } from "../../client/clients-controller";

export class GameRoomPrivate extends GameRoom {
  private _ExpectedPlayersController: ClientsController;
  private _creator: Client;
  private _accessKeys: string[] = [];
  private _rejectedBy: ClientData;

  constructor(config: GameConfig, client: Client, playersToInvite: Client[]) {
    super(config);
    this.key = "private|" + this.key;
    this.onOpen(client, playersToInvite);
  }

  private get expectedPlayersInfo(): ClientData[] {
    return this._ExpectedPlayersController ? this._ExpectedPlayersController.clientsInfo : undefined;
  }

  private get expectedPlayers(): Client[] {
    return this._ExpectedPlayersController ? this._ExpectedPlayersController.clients : [];
  }

  private get inviatationData(): GameInvitation {
    return {
      creator: this._creator.id,
      game: this.details
    };
  }

  public get accessKeys(): string[] {
    return this._accessKeys;
  }

  public get details(): GameInfo {
    const details = super.details;
    details.playersExpected = this.expectedPlayersInfo;
    details.rejectedBy = this._rejectedBy;
    return details;
  }

  public get expectingPlayers(): boolean {
    return this._ExpectedPlayersController ? this._ExpectedPlayersController.hasClients : false;
  }

  private setAccessKeys(): void {
    this._accessKeys = Array.from(this._ExpectedPlayersController.clientsIds);
    this._accessKeys.push(this._creator.id);
  }

  private isCreator(client: Client): boolean {
    return client.id === this._creator.id;
  }

  private getClientsForInvitationResponse(client: Client): Client[] {
    const peersInGame = this.getClientPeers(client);
    const clientsWaitingResponse = this.getClientsPendingInvitationResponse(client);
    return peersInGame.concat(clientsWaitingResponse);
  }

  private getClientsPendingInvitationResponse(client: Client): Client[] {
    let clientsToNotify = this.expectedPlayers.filter(clientToNotify => clientToNotify.id !== client.id);
    if (this._rejectedBy) {
      clientsToNotify = clientsToNotify.filter(clientToNotify => clientToNotify.id !== this._rejectedBy.id);
    }
    return clientsToNotify;
  }

  private rejectionAllowed(client: Client): boolean {
    return this.expectingPlayers && !this.isCreator(client) && !this.clientExists(client);
  }

  private onOpen(client: Client, playersToInvite: Client[]): void {
    this._creator = client;
    this._ExpectedPlayersController = new ClientsController();
    this._ExpectedPlayersController.clients = playersToInvite;
    this.setAccessKeys();
    this.addPlayer(client);
    this.broadcastRoomInvitations();
  }

  // private onAcceptInvitationFromJoinedClient(client: Client): void {
  //   if (this.expectingPlayers) {
  //     client.sendError(MessageErrorType.WaitForPlayersToJoin, this.inviatationData);
  //     return;
  //   }
  //   this.notifyPlayerForForbiddenAction(client, MessageInType.GameInvitationAccept);
  // }

  // public clientAllowed(client: Client): boolean {
  //   return this.accessKeys.includes(client.id);
  // }

  // public invitationAcceptanceAllowed(client: Client): boolean {
  //   if (!this.clientAllowed(client)) {
  //     client.notify(MessageOutType.GameAccessForbidden, this.info);
  //     return false;
  //   }
  //   if (this.clientExists(client)) {
  //     this.onAcceptInvitationFromJoinedClient(client);
  //     return false;
  //   }
  //   return true;
  // }

  public joinClient(client: Client): void {
    console.log("joinClient in private room");
    // !this.entranceAllowed ? this.broadcastForbiddenEntrance(client) : this.addPlayer(client);
  }

  public onRejectInvitation(client: Client) {
    if (this.rejectionAllowed(client)) {
      this.clearStartTimeout();
      this._rejectedBy = client.info;
      this.broadcastInvitationRejected(client);
      // this._accessKeys = [];
    } else {
      this.notifyPlayerForForbiddenAction(client, MessageInType.GameInvitationReject);
    }
  }

  public onPlayerLeft(client: Client): void {
    this.removePlayer(client);
    if (this.expectingPlayers && this.isCreator(client)) {
      this.broadcastInvitationCanceled(client);
      // this._accessKeys = [];
      // this._creator = undefined;
    }
    this.broadcastPlayerInOut(client, MessageOutType.PlayerLeft);
  }

  // MESSAGE BROADCAST
  private broadcastRoomInvitations(): void {
    const data = this.inviatationData;
    this.expectedPlayers.forEach(client => {
      client.sendMessage(MessageOutType.GameInvitation, data);
    });
  }

  private notifyPlayerForForbiddenAction(client: Client, type: MessageInType): void {
    client.sendErrorMessage(ErrorType.GameActionForbidden, { type });
  }

  private broadcastInvitationRejected(client: Client): void {
    const invitation = this.inviatationData;
    const rejectedBy = this._rejectedBy;
    const clientsToNotify = this.getClientsForInvitationResponse(client);
    clientsToNotify.forEach(player => {
      player.sendMessage(MessageOutType.GameInvitationRejected, { rejectedBy, invitation });
    });
  }

  private broadcastInvitationCanceled(client: Client): void {
    const clientsToNotify = this.getClientsPendingInvitationResponse(client);
    clientsToNotify.forEach(player => {
      player.sendMessage(MessageOutType.GameInvitationCanceled, this.inviatationData);
    });
  }
}
