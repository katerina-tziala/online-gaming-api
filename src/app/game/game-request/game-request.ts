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

  public get status(): RequestStatus {
    return this._status;
  }

  private set playersToRespond(playersToRespond: string[]) {
    playersToRespond.forEach((clientId) =>
      this._PlayersState.set(clientId, RequestStatus.Pending)
    );
  }

  public get requestConfirmed(): boolean {
    return this._PlayersState.size && this.receivedRequest.every(clientId => this.clientConfirmed(clientId));
  }

  public get receivedRequest(): string[] {
    return Array.from(this._PlayersState.keys());
  }

  public get pendingResponse(): string[] {
    return this.receivedRequest.filter((playerId) =>
      this.clientPendingResponse(playerId)
    );
  }

  public get confirmedBy(): string[] {
    return this.receivedRequest.filter((playerId) =>
      this.clientConfirmed(playerId)
    );
  }

  public get rejectedBy(): string[] {
    return this.receivedRequest.filter((playerId) =>
      this.clientRejected(playerId)
    );
  }

  private getClientState(clientId: string): RequestStatus {
    return this._PlayersState.get(clientId);
  }

  public clientPendingResponse(clientId: string): boolean {
    return this.getClientState(clientId) === RequestStatus.Pending;
  }

  public clientRejected(clientId: string): boolean {
    return this.getClientState(clientId) === RequestStatus.Rejected;
  }

  public clientConfirmed(clientId: string): boolean {
    return this.getClientState(clientId) === RequestStatus.Confirmed;
  }

  public requestCreator(clientId: string): boolean {
    return this._requestedBy === clientId;
  }

  public clientInvolvedInRequest(clientId: string): boolean {
    return this.requestCreator(clientId) || this._PlayersState.has(clientId);
  }

  public clientAllowedToConfirm(clientId: string): boolean {
    return !this.requestCreator(clientId) && !this.clientConfirmed(clientId);
  }

  public clientAllowedToReject(clientId: string): boolean {
    return !this.requestCreator(clientId) && !this.clientRejected(clientId);
  }

  public createRequest(requestedBy: string, playersToRespond: string[]): void {
    this._requestedBy = requestedBy;
    this._requestedAt = new Date().toString();
    this._status = RequestStatus.Pending;
    this.playersToRespond = playersToRespond;
  }

  public rejectRequest(clientId: string): void {
    if (this._PlayersState.has(clientId)) {
      this._status = RequestStatus.Rejected;
      this._PlayersState.set(clientId, RequestStatus.Rejected);
    }
  }

  public confirmRequest(clientId: string): void {
    if (this._PlayersState.has(clientId)) {
      this._PlayersState.set(clientId, RequestStatus.Confirmed);
      this.checkRequestStatus();
    }
  }

  private checkRequestStatus(): void {
    if (this.requestConfirmed) {
      this._status = RequestStatus.Confirmed;
    }
  }

  public setPendingResponse(clientId: string): void {
    if (this._PlayersState.has(clientId)) {
      this._status = RequestStatus.Pending;
      this._PlayersState.set(clientId, RequestStatus.Pending);
    }
  }
}
