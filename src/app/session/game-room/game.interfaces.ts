import { Duration } from "../../duration.interface";
import { GameConfig } from "../../game/game-config/game-config";
import { ClientData } from "../../client/client-data.interface";
import { GameRequestInterface } from "../../game/game-request/game-request.interface";
import { RequestStatus } from "../../game/game-request/request-status.enum";
export interface GameRoomInfo {
  id: string;
  createdAt?: string;
  key?: string;
  config?: GameConfig;
  allPlayersJoined?: boolean;
  createdBy?: ClientData;
  status?: RequestStatus;
  confirmedBy?: ClientData[];
  pendingResponse?: ClientData[];
  rejectedBy?: ClientData[];
}

export interface GameState {
  idle: boolean;
  startedAt: string;
  endedAt: string;
  playerStartId?: string;
  playersTurns?: string[];
  teamsTurns?: string[];
  players?: ClientData[];
  completedIn?: Duration;
}

export interface GameInfo extends GameRoomInfo {
  gameState: GameState;
  restartRequest?: GameRequestInterface;
}

export interface PlayerInOut {
  player: ClientData;
  game: GameInfo;
}

export interface PlayerMesssage {
  sender: ClientData;
  data: {};
  game?: GameInfo;
}
