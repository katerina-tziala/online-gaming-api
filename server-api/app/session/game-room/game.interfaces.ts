import { ClientData } from '../../client/client-data.interface';
import { Duration } from '../../duration.interface';
import { GameConfig } from '../../game/game-config/game-config';
import { GameRequestInterface } from '../../game/game-request/game-request.interface';
import { RequestStatus } from '../../game/game-request/request-status.enum';
import { PlayerMove } from '../../game/moves-collection/player-move.interface';
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
  movesCollection?: PlayerMove[]
}

export interface GameInfo extends GameRoomInfo {
  gameState: GameState;
  restartRequest?: GameRequestInterface;
}

export interface PlayerInOut {
  player: ClientData;
  game: GameInfo;
}

export interface PlayerMessage {
  sender: ClientData;
  game: GameInfo;
  moveData: {};
}
