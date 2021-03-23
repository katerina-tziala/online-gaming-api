import { Client } from "../../utilities/client";
import { Session } from "../session";
import { MessageOutType } from "../../messages/message-types.enum";
import { GameConfig, ConfigUtils } from "./game-config/game-config";
import { GameInfo } from "./game-info.interface";
import {
  getDurationFromDates,
  getRandomValueFromArray,
} from "../../utilities/app-utils";
import { Duration } from "../../interfaces/duration.interface";
import { GameRoomSession } from "./game-room-session";
import { UserData } from "../../interfaces/user-data.interface";

export class PrivateGameRoomSession extends GameRoomSession {
  private _expectedPlayers: Map<string, Client> = new Map();
  private _creator: Client;

  constructor(config: GameConfig, settings?: {}) {
    super(config, settings);

  }

  public get expectedPlayers(): Client[] {
    return Array.from(this._expectedPlayers.values());
  }

  public get expectedPlayersInfo(): UserData[] {
    return this.expectedPlayers.map(player => player.info);
  }

  public onOpen(client: Client, expectedPlayers: Client[]) {
    this._creator = client;
    this.addInClients(client);
    expectedPlayers.forEach(player => this._expectedPlayers.set(player.id, player));
    this.broadcastRoomOpened(client);
    this.broadcastRoomInvitations();
  }

  public broadcastRoomOpened(client: Client): void {
    const data = {
      user: client.info,
      game: this.details,
      playersExpected: this.expectedPlayersInfo
    };
    client.notify(MessageOutType.GameRoomOpened, data);
  }

  public broadcastRoomInvitations(): void {
    const data = {
      creator: this._creator.info,
      game: this.details,
      playersExpected: this.expectedPlayersInfo
    };
    this.expectedPlayers.forEach(client => {
      client.notify(MessageOutType.GameInvitation, data);
    });
  }

  public playerExpected(client: Client): boolean {
    return this._expectedPlayers.has(client.id);
  }

  public playerEntranceAllowed(client: Client): boolean {
    return this.entranceAllowed && this.playerExpected(client);
  }


  public invitationAcceptanceAllowed(client: Client): boolean {
    // restart invitation
    // game state


    if (this._creator.id === client.id) {
      console.log("notify creator cannot accept invitation");
      return false;
    } else if (this.clientExists(client)) {
      console.log("notify player already in accepted invitation");
      return false;
    } else if (this.playerExpected(client)) {
      console.log("player expected");
      console.log("put player in game");
      return true;
    } else {
      console.log("client forbidden");
      return false;
    }
  }







}
