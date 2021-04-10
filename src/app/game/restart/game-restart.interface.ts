import { GameRequestInterface } from "../game-request/game-request.interface";

export interface GameRestart extends GameRequestInterface {
  gameId: string;
}