import { Client } from "../../utilities/client";
import { MessageErrorType, MessageInType, MessageOutType } from "../../messages/message-types.enum";
import { GameConfig } from "./game-config/game-config";
import { GameInvitation, GameRoomOpened, PlayerEntrance } from "./game.interfaces";
import { GameRoomSession } from "./game-room-session";
import { UserData } from "../../interfaces/user-data.interface";

export class PrivateGameSession extends GameRoomSession {
  private _expectedPlayers: Map<string, Client> = new Map();
  private _creator: Client;
  private accessKeys: string[] = [];

  constructor(config: GameConfig, settings?: {}) {
    super(config, settings);
  }

  public get expectingPlayers(): boolean {
    return !!this._expectedPlayers.size;
  }

  public get expectedPlayers(): Client[] {
    return Array.from(this._expectedPlayers.values());
  }

  public get expectedPlayersInfo(): UserData[] {
    return this.expectedPlayers.map(player => player.info);
  }

  private get inviatationData(): GameInvitation {
    return {
      creator: this._creator.id,
      game: this.details,
      playersExpected: this.expectedPlayersInfo
    };
  }

  private setAccessKeys(): void {
    this.accessKeys = Array.from(this._expectedPlayers.keys());
    this.accessKeys.push(this._creator.id);
  }

  public onOpen(client: Client, expectedPlayers: Client[]) {
    this._creator = client;
    this.addInClients(client);
    expectedPlayers.forEach(player => this._expectedPlayers.set(player.id, player));
    this.setAccessKeys();
    this.broadcastRoomOpened(client);
    this.broadcastRoomInvitations();
  }

  public getOpenedRoomData(client: Client): GameRoomOpened {
    const data = super.getOpenedRoomData(client);
    data.playersExpected = this.expectedPlayersInfo;
    return data;
  }

  public broadcastRoomInvitations(): void {
    const data = this.inviatationData;
    this.expectedPlayers.forEach(client => {
      client.notify(MessageOutType.GameInvitation, data);
    });
  }

  private onAcceptInvitationFromJoinedClient(client: Client): void {
    if (this.expectingPlayers) {
      client.sendError(MessageErrorType.WaitForPlayersToJoin, this.inviatationData);
      return;
    }
    this.notifyPlayerForForbiddenAction(client, MessageInType.GameInvitationAccept);
  }

  public clientAllowed(client: Client): boolean {
    return this.accessKeys.includes(client.id);
  }

  public invitationAcceptanceAllowed(client: Client): boolean {
    if (!this.clientAllowed(client)) {
      client.notify(MessageOutType.GameAccessForbidden, this.info);
      return false;
    }
    if (this.clientExists(client)) {
      this.onAcceptInvitationFromJoinedClient(client);
      return false;
    }
    return true;
  }

  public getPlayerEntranceData(clientJoined: Client): PlayerEntrance {
    const data = super.getPlayerEntranceData(clientJoined);
    data.playersExpected = this.expectedPlayersInfo;
    return data;
  }

  public joinClient(client: Client): void {
    this._expectedPlayers.delete(client.id);
    this.addClient(client);
  }

  private notifyPlayerForForbiddenAction(client: Client, type: MessageInType): void {
    client.sendError(MessageErrorType.GameActionForbidden, { type });
  }


  public rejectInvitation(client: Client): Client[] {
    if (!this.expectingPlayers || client.id === this._creator.id || this.clientExists(client)) {
      this.notifyPlayerForForbiddenAction(client, MessageInType.GameInvitationReject);
      return [];
    }
    this.broadcastInvitationRejected(client);
    this._expectedPlayers = new Map();
    this._creator = undefined;
    this.accessKeys = [];
    return this.clients;
  }

  private broadcastInvitationRejected(client: Client) {
    const gameData = this.info;
    gameData.entranceAllowed = undefined;
    const data = {
      sender: this._creator.info,
      game: gameData
    };
    let clientsToNotify = this.getClientPeers(client);
    clientsToNotify = clientsToNotify.concat(this.expectedPlayers);
    clientsToNotify.forEach(player => {
      player.notify(MessageOutType.GameInvitationRejected, data);
    });
  }


  public cancelInvitation(client: Client): Client[] {
    if (!this.expectingPlayers || client.id !== this._creator.id) {
      this.notifyPlayerForForbiddenAction(client, MessageInType.GameInvitationCancel);
      return [];
    }
    this.broadcastInvitationCanceled(client);
    this._expectedPlayers = new Map();
    this._creator = undefined;
    this.accessKeys = [];
    return this.clients;
  }

  private broadcastInvitationCanceled(client: Client) {
    const gameData = this.info;
    gameData.entranceAllowed = undefined;
    const data = {
      sender: this._creator.info,
      game: gameData
    };
    let clientsToNotify = this.getClientPeers(client);
    clientsToNotify = clientsToNotify.concat(this.expectedPlayers);
    clientsToNotify.forEach(player => {
      player.notify(MessageOutType.GameInvitationCanceled, data);
    });
  }

}
