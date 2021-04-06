import { Client } from "../../client/client";
import { ClientData } from "../../client/client-data.interface";
import { Session } from "../session";
import { ConfigUtils, GameConfig } from "./game-config/game-config";
import { GameInfo, GameRoomInfo, GameState, PlayerInOut, PlayerMesssage } from "./game.interfaces";
import { ErrorType } from "../../error-type.enum";
import { MessageInType, MessageOutType } from "../../messages/message-types/message-types.enum";
import { MessageIn } from "../../messages/message.interface";
import { Chat } from "../../chat.interface";
import { GameMessagingChecker } from "./game-messaging-checker";
import { Game } from "../../game/game";
import { GameRoom } from "./game-room";
import { ClientsController } from "../../controllers/clients-controller";

export class GameRoomPrivate extends GameRoom {
  private _ExpectedPlayersController: ClientsController = new ClientsController();
  private _creator: Client;

  constructor(config: GameConfig, client: Client, playersToInvite: Client[]) {
    super(config);
    this._creator = client;
    this._ExpectedPlayersController.clients = playersToInvite;

    console.log(this.info);
  }



  public joinClient(client: Client): void {
    // !this.entranceAllowed ? this.broadcastForbiddenEntrance(client) : this.addPlayer(client);
  }

  protected getPlayerInOutData(client: Client): PlayerInOut {
    return {
      player: client.info,
      game: this.details,
    };
  }


  public onPlayerLeft(client: Client): void {
    console.log("left from private room");

    // clearTimeout(this.startTimeout);
    // this.removeClient(client);
    // client.gameRoomId = null;
    // this.broadcastPlayerInOut(client, MessageOutType.PlayerLeft);
  }

}
