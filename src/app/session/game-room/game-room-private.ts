import { Client } from "../../client/client";
import { ClientData } from "../../client/client-data.interface";
import { ConfigUtils, GameConfig } from "./game-config/game-config";
import { GameInfo, GameInvitation, GameRoomInfo, GameState, PlayerInOut, PlayerMesssage } from "./game.interfaces";
import { ErrorType } from "../../error-type.enum";
import { MessageInType, MessageOutType } from "../../messages/message-types/message-types.enum";
import { MessageIn } from "../../messages/message.interface";
import { Chat } from "../../chat.interface";
import { GameMessagingChecker } from "./game-messaging-checker";
import { Game } from "../../game/game";
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
      game: this.details,
      playersExpected: this.expectedPlayersInfo
    };
  }

  private setAccessKeys(): void {
    this._accessKeys = Array.from(this._ExpectedPlayersController.clientsIds);
    this._accessKeys.push(this._creator.id);
  }

  private onOpen(client: Client, playersToInvite: Client[]): void {
    this._creator = client;
    this._ExpectedPlayersController = new ClientsController();
    this._ExpectedPlayersController.clients = playersToInvite;
    this.setAccessKeys();
    this.addPlayer(client);
    this.broadcastRoomInvitations();

    //
  }






  public joinClient(client: Client): void {
    // !this.entranceAllowed ? this.broadcastForbiddenEntrance(client) : this.addPlayer(client);
  }

  protected getPlayerInOutData(client: Client): PlayerInOut {
    const data = super.getPlayerInOutData(client);
    data.playersExpected = this.expectedPlayersInfo;
    return data;
  }


  public onPlayerLeft(client: Client): void {
    console.log("left from private room");

    // clearTimeout(this.startTimeout);
    // this.removeClient(client);
    // client.gameRoomId = null;
    // this.broadcastPlayerInOut(client, MessageOutType.PlayerLeft);
  }


  private broadcastRoomInvitations(): void {
    const data = this.inviatationData;
    this.expectedPlayers.forEach(client => {
      client.sendMessage(MessageOutType.GameInvitation, data);
    });
  }
}
