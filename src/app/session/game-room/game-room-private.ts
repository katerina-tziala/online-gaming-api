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

  public get details(): GameInfo {
    const details = super.details;
    details.playersExpected = this.expectedPlayersInfo;
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
    let clientsToNotify = this.getClientPeers(client);
    clientsToNotify = clientsToNotify.concat(this.expectedPlayers);
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
    //
    this.onRejectInvitation(client);
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


  public onRejectInvitation(client: Client) {
    if (this.rejectionAllowed(client)) {
      this.clearStartTimeout();
      this._accessKeys = [];
      this.broadcastInvitationRejected(client);
    } else {
      this.notifyPlayerForForbiddenAction(client, MessageInType.GameInvitationReject);
    }
  }

  public joinClient(client: Client): void {
    // !this.entranceAllowed ? this.broadcastForbiddenEntrance(client) : this.addPlayer(client);
  }

  public onPlayerLeft(client: Client): void {
    this.removePlayer(client);
    console.log("left from private room");
    // if creator -> send invitation calceled
    // clearTimeout(this.startTimeout);
    // this.removeClient(client);
    // client.gameRoomId = null;
    // this.broadcastPlayerInOut(client, MessageOutType.PlayerLeft);
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

  private broadcastInvitationRejected(client: Client) {
    const invitation = this.inviatationData;
    const rejectedBy = client.info;
    const clientsToNotify = this.getClientsForInvitationResponse(client);
    clientsToNotify.forEach(player => {
      player.sendMessage(MessageOutType.GameInvitationRejected, { rejectedBy, invitation });
    });
  }

}
