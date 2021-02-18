import { Client } from "../utilities/client";
import { Session } from "./session";

export class GameRoomSession extends Session {
  private _allowedPlayers: number = 2;
  private _origin: string;
  public roomType: string;
  private _url: string;
  private _properties: {} = {};

  constructor(origin: string, allowedPlayers = 2, type = "default") {
    super();
    this._origin = origin;
    this._allowedPlayers = allowedPlayers;
    this._url = `${this._origin}?gameId=${this.id}`;
    this.roomType = type;
  }

  public set properties(properties: {}) {
    this._properties = properties || this._properties;
  }

  public get details() {
    const gameDetails = {
      id: this.id,
      roomType: this.roomType,
      entryURL: this._url,
    };
    return { ...gameDetails, ...this.properties };
  }

  public get roomFilled() {
    return this.clientsList.length === this._allowedPlayers;
  }





  public addClient(client: Client): void {
    if (this.roomFilled) {
      console.log("no more players allowed");
      return;
    }

    this.addInClients(client);
    client.gameRoomId = this.id;

    if (this.roomFilled) {
      console.log("all players joined");

      return;
    }
    client.sendUserUpdate(this.getPeersDetailsOfClient(client));
  }
}
