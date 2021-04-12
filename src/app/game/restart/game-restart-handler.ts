import { Client } from '../../client/client';
import { ClientsController } from '../../controllers/clients-controller';
import { ErrorType } from '../../error-type.enum';
import { MessageInType, MessageOutType } from '../../messages/message-types/message-types';
import { GameRequest } from '../game-request/game-request';
import { GameRequestInterface } from '../game-request/game-request.interface';
import { GameRestart } from './game-restart.interface';


export class GameRestartHandler {
    private _messageHandlingConfig: Map<string, (client: Client, peers?: Client[]) => void> = new Map();
    private id: string;
    private _RestartRequest: GameRequest;
    private _PlayersController: ClientsController;
    private _onRestartConfirmed: () => void;

    constructor(id: string, onRestartConfirmed: () => void) {
        this.id = id;
        this._onRestartConfirmed = onRestartConfirmed;
        this.setMessageHandling();
        this.init();
    }

    public get requested(): boolean {
        return this._RestartRequest ? this._RestartRequest.requestExists : false;
    }

    public get restartRequest(): GameRequestInterface {
        return this._RestartRequest.request;
    }

    private get gameRestartRequest(): GameRestart {
        const request = this._RestartRequest.request;

        if (!request) {
            return;
        }

        return {
            ...request,
            gameId: this.id
        };
    }

    private setMessageHandling(): void {
        this._messageHandlingConfig.set(MessageInType.GameRestartCancel, this.onRestartCancel.bind(this));
        this._messageHandlingConfig.set(MessageInType.GameRestartAccept, this.onRestartAccept.bind(this));
        this._messageHandlingConfig.set(MessageInType.GameRestartReject, this.onRestartReject.bind(this));
    }

    public init(): void {
        this._RestartRequest = new GameRequest();
        this._PlayersController = new ClientsController();
    }

    private onGameRestart(client: Client, peers: Client[]): void {
        if (!this.requested) {
            this.createRestartRequest(client, peers);
        } else {
          this.onGameRestartWhenRequestExists(client);
        }
    }

    private createRestartRequest(client: Client, peers: Client[]): void {
        this._RestartRequest.createRequest(client.id, peers.map(peer => peer.id));
        this._PlayersController.clients = [client].concat(peers);
        this.broadcastRequestToClients(MessageOutType.GameRestartRequested);
    }

    private onGameRestartWhenRequestExists(client: Client): void {
        if (this._RestartRequest.requestCreator(client.id)) {
            this.broadcastRestartWaitForConfirmation(client, MessageInType.GameRestart);
        } else if(this._RestartRequest.clientPendingResponse(client.id)){
            this.acceptRestart(client);
        }
    }

    private onRestartCancel(client: Client): void {
        if (!this._RestartRequest.requestCreator(client.id)) {
            client.sendErrorMessage(ErrorType.RestartNotRequestedByPlayer, this.gameRestartRequest);
            return;
        }
        this.broadcastRequestToClients(MessageOutType.GameRestartCanceled);
        this.init();
    }

    private onRestartAccept(client: Client): void {
        if (!this._RestartRequest.clientInvolvedInRequest(client.id)) {
            this.broadcastGameActionNotAllowed(client, MessageInType.GameRestartAccept);
        } else if (this._RestartRequest.clientAllowedToConfirm(client.id)) {
            this.acceptRestart(client);
        } else {
            this.broadcastRestartWaitForConfirmation(client, MessageInType.GameRestartAccept);
        }
    }

    private acceptRestart(client: Client): void {
        this._RestartRequest.confirmRequest(client.id);
        this.broadcastRequestToClients(MessageOutType.GameRestartAccepted);
        if (this._RestartRequest.requestConfirmed) {
            this._onRestartConfirmed();
            this.init();
        }
    }

    public onRestartReject(client: Client): void {
        if (this._RestartRequest.requestCreator(client.id)) {
            this.onRestartCancel(client);
        } else if (this._RestartRequest.clientAllowedToReject(client.id)) {
            this.rejectRestart(client);
        } else {
            this.broadcastGameActionNotAllowed(client, MessageInType.GameRestartReject);
        }
    }

    private rejectRestart(client: Client): void {
        this._RestartRequest.rejectRequest(client.id);
        this.broadcastRequestToClients(MessageOutType.GameRestartRejected);
        this.init();
    }

    private onRestartRequestResponse(client: Client, type: MessageInType): void {
        if (!this.requested) {
            this.broadcastRestartNotRequested(client, type);
            return;
        }
        this._messageHandlingConfig.get(type)(client);
    }

    public onMessage(client: Client, type: MessageInType, peers?: Client[]): void {
        if (this._messageHandlingConfig.has(type)) {
            this.onRestartRequestResponse(client, type);
        } else {
            this.onGameRestart(client, peers);
        }
    }

    // MESSAGE BROADCAST
    private broadcastRequestToClients(type: MessageOutType): void {
        this._PlayersController.clients.forEach((client) => client.sendMessage(type, this.gameRestartRequest));
    }

    private broadcastRestartNotRequested(client: Client, type: MessageInType): void {
        client.sendErrorMessage(ErrorType.RestartNotRequested, { type });
    }

    private broadcastRestartWaitForConfirmation(client: Client, type: MessageInType): void {
        client.sendErrorMessage(ErrorType.GameRestartWaitConfrimation, { type, restartRequest: this.gameRestartRequest });
    }

    private broadcastGameActionNotAllowed(client: Client, type: MessageInType): void {
        client.sendErrorMessage(ErrorType.GameActionForbidden, { type });
    }
}