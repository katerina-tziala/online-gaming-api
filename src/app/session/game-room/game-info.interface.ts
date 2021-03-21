import { GameConfig } from "./game-config/game-config";
import { Duration } from "../../interfaces/duration.interface";
import { ClientData } from "../../interfaces/user-data.interface";

export interface GameInfo extends GameConfig {
  id: string;
  entranceAllowed: boolean;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  settings?: {};
  playerStartId?: string;
  players?: ClientData[];
  completedIn?: Duration;
}
