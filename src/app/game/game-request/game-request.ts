import { GameRequestInterface } from "./game-request.interface";
import { RequestStatus } from "./request-status.enum";

export class GameRequest {
  private _PlayersState: Map<string, RequestStatus> = new Map();
  private _requestedBy: string;
  private _requestedAt: string;
  private _status: RequestStatus;

  public get requestExists(): boolean {
    return !!this._requestedAt;
  }

  public get request(): GameRequestInterface {
    if (!this.requestExists) {
      return;
    }
    return {
      requestedAt: this._requestedAt,
      requestedBy: this._requestedBy,
      status: this._status,
      pendingResponse: this.pendingResponse,
      confirmedBy: this.confirmedBy,
      rejectedBy: this.rejectedBy,
    };
  }

  private set playersToRespond(playersToRespond: string[]) {
    playersToRespond.forEach((playerId) =>
      this._PlayersState.set(playerId, RequestStatus.Pending)
    );
  }

  public get requestConfirmed(): boolean {
    return this._PlayersState.size && this.receivedRequest.every(playerId => this.playerConfirmed(playerId));
  }

  public get receivedRequest(): string[] {
    return Array.from(this._PlayersState.keys());
  }

  public get pendingResponse(): string[] {
    return this.receivedRequest.filter((playerId) =>
      this.playerPendingResponse(playerId)
    );
  }

  public get confirmedBy(): string[] {
    return this.receivedRequest.filter((playerId) =>
      this.playerConfirmed(playerId)
    );
  }

  public get rejectedBy(): string[] {
    return this.receivedRequest.filter((playerId) =>
      this.playerRejected(playerId)
    );
  }

  public getPlayerState(playerId: string): RequestStatus {
    return this._PlayersState.get(playerId);
  }

  public playerPendingResponse(playerId: string): boolean {
    return this.getPlayerState(playerId) === RequestStatus.Pending;
  }

  public playerRejected(playerId: string): boolean {
    return this.getPlayerState(playerId) === RequestStatus.Rejected;
  }

  public playerConfirmed(playerId: string): boolean {
    return this.getPlayerState(playerId) === RequestStatus.Confirmed;
  }

  public playerCreatedRequest(playerId: string): boolean {
    return this._requestedBy === playerId;
  }

  public createRequest(requestedBy: string, playersToRespond: string[]): void {
    this._requestedBy = requestedBy;
    this._requestedAt = new Date().toString();
    this._status = RequestStatus.Pending;
    this.playersToRespond = playersToRespond;
  }

  public rejectRequest(playerId: string): void {
    this._status = RequestStatus.Rejected;
    this._PlayersState.set(playerId, RequestStatus.Rejected);
  }

  public confirmRequest(playerId: string): void {
    this._PlayersState.set(playerId, RequestStatus.Confirmed);
    if (this.requestConfirmed) {
        this._status = RequestStatus.Confirmed;
    }
  }
}
