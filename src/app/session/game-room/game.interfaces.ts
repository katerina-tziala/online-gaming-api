import { Duration } from "../../duration.interface";
import { GameConfig } from "./game-config/game-config.inteface";
import { ClientData } from "../../client/client-data.interface";

export interface GameInfo extends GameConfig {
  id: string;
  filled: boolean;
  idle: boolean;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  playerStartId?: string;
  players?: ClientData[];
  completedIn?: Duration;
  expectedRestartCorfirmations?: string[];
}

export interface PlayerInOut {
  player: ClientData;
  game: GameInfo;
  playersExpected?: ClientData[];
}

export interface PlayerMesssage {
  sender: ClientData;
  data: {};
  game?: GameInfo;
}




// export interface GameInvitation {
//   creator: string;
//   game: GameInfo;
//   playersExpected?: ClientData[];
// }

// export interface GameRestart {
//   id: string;
//   createdAt: string;
//   playerRequested: ClientData;
//   playersConfirmed?: ClientData[];
//   playersExpectedToConfirm?: ClientData[];
// }