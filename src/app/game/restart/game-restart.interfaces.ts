import { Duration } from "../../duration.interface";
import { GameConfig } from "../game-config/game-config.inteface";
import { ClientData } from "../../client/client-data.interface";


export interface GameRestart {
  gameId: string;
  requesteAt: string;
  requestedBy: ClientData;
  confirmedBy?: ClientData[];
  expectedToConfirm?: ClientData[];
}