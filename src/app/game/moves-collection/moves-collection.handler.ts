import { defined } from "../../validators/validator-type";
import { Client } from "../../client/client";
import { ErrorType } from "../../error-type.enum";
import { PlayerMove } from "./player-move.interface";

export class MovesCollectionHandler {
  private _playersIds: string[] = [];
  private _movesCollection: Map<string, any>;

  constructor() {
    this.initMoves();
  }

  public set playersIds(playersIds: string[]) {
    this._playersIds = playersIds || [];
  }

  public initMoves(): void {
    this._movesCollection = new Map();
  }

  public get allMovesSubmitted(): boolean {
    if (this._playersIds.length) {
      return this._playersIds.every(playerId => this._movesCollection.has(playerId));
    }
    return false;
  }

  public get moves(): PlayerMove[] {
    return this._playersIds.map(playerId => {
      return {
        playerId,
        moveData: this._movesCollection.get(playerId)
      }
    });
  }

  public submitMove(client: Client, moveData: any): ErrorType {
    const errorType = this.playerMoveError(client, moveData);
    if (errorType) {
      return errorType;
    }
    this._movesCollection.set(client.id, moveData);
    return;
  }

  private playerMoveError(client: Client, moveData: any): ErrorType {
    return (
      this.playerActionAllowedError(client) ||
      this.playerMoveDataValidationError(moveData) ||
      this.playerMoveSubmittedError(client)
    );
  }

  private playerActionAllowedError(client: Client): ErrorType {
    return this._playersIds.includes(client.id)
      ? undefined
      : ErrorType.GameActionForbidden;
  }

  private playerMoveDataValidationError(moveData: any): ErrorType {
    return !defined(moveData) ? ErrorType.MoveNotDefined : undefined;
  }

  private playerMoveSubmittedError(client: Client): ErrorType {
    return this._movesCollection.has(client.id) ? ErrorType.MoveSubmitted : undefined;
  }
}
