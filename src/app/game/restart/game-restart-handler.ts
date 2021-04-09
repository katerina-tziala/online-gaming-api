import { MessageInType, MessageOutType } from "../../messages/message-types/message-types.enum";
import { Client } from "../../client/client";
import { ClientData } from "../../client/client-data.interface";
import { ClientsController } from "../../controllers/clients-controller";
import { GameRestart } from "./game-restart.interfaces";
import { ErrorType } from "../../error-type.enum";


export class GameRestartHandler {
    private _messageHandlingConfig: Map<string, (client: Client, peers?: Client[]) => void> = new Map();
    private id: string;
    private _PlayersExpectedToConfirmController: ClientsController;
    private _PlayersConfirmedController: ClientsController;
    private _requestedBy: Client;
    private _requesteAt: string;

    constructor(id: string) {
        this.id = id;
        this.setMessageHandling();
        this.init();
    }

    private get confirmedBy() {
        return this._PlayersConfirmedController.clientsInfo;
    }

    private get expectedToConfirm(): ClientData[] {
        return this._PlayersExpectedToConfirmController.clientsInfo;
    }

    private get clientsConfirmed(): Client[] {
        return this._PlayersConfirmedController.clients;
    }

    private get clientsExpectedToConfirm(): Client[] {
        return this._PlayersExpectedToConfirmController.clients;
    }

    private get restartRequestInfo(): GameRestart {
        return {
            gameId: this.id,
            requesteAt: this._requesteAt,
            requestedBy: this._requestedBy.info,
            confirmedBy: this.confirmedBy,
            expectedToConfirm: this.expectedToConfirm
        }
    }

    private setMessageHandling(): void {
        this._messageHandlingConfig.set(MessageInType.GameRestartCancel, this.onRestartCancel.bind(this));
        this._messageHandlingConfig.set(MessageInType.GameRestartAccept, this.onRestartAccept.bind(this));
        this._messageHandlingConfig.set(MessageInType.GameRestartReject, this.onRestartReject.bind(this));
    }

    public get requested(): boolean {
        return !!this._requesteAt;
    }

    public init(): void {
        this._PlayersExpectedToConfirmController = new ClientsController();
        this._PlayersConfirmedController = new ClientsController();
        this._requesteAt = undefined;
        this._requestedBy = undefined;
    }

    public clientRequestedRestart(client: Client): boolean {
        return client.id === this._requestedBy?.id;
    }

    public playerExpectedToConfirm(client: Client): boolean {
        return this._PlayersExpectedToConfirmController.clientExists(client);
    }

    private onGameRestart(client: Client, peers: Client[]): void {
        if (!this.requested) {
            this.createRestartRequest(client, peers);
        } else {
          this.onGameRestartWhenRequestExists(client);
        }
    }

    private createRestartRequest(client: Client, peers: Client[]): void {
        this._PlayersExpectedToConfirmController.clients = peers;
        this._requesteAt = new Date().toString();
        this._requestedBy = client;
        this.broadcastRequestToClients(this._PlayersExpectedToConfirmController.clients, MessageOutType.GameRestartRequested);
    }

    private onGameRestartWhenRequestExists(client: Client): void {
        if(this.clientRequestedRestart(client)) {
            this.broadcastRequestToClients([client], MessageOutType.GameRestartWaitConfrimation);
        } else if(this.playerExpectedToConfirm(client)) {
            console.log("accept restart");
            console.log(client.info);
            console.log(this.restartRequestInfo);
        }
    }

    private onRestartCancel(client: Client): void {
        if (!this.clientRequestedRestart(client)) {
            client.sendErrorMessage(ErrorType. RestartNotRequestedByPlayer, this.restartRequestInfo);
            return;
        }
       const playersToNotify = this.clientsConfirmed.concat(this.clientsExpectedToConfirm);
       this.broadcastRequestToClients(playersToNotify, MessageOutType.GameRestartCanceled);
       this.init();
    }

    private onRestartAccept(client: Client): void {
        console.log("onRestartAccept");
        console.log(client.info);

    }

    private onRestartReject(client: Client): void {
        console.log("onRestartReject");
        console.log(client.info);

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
    private broadcastRequestToClients(clients: Client[], type: MessageOutType): void {
        clients.forEach((client) => client.sendMessage(type, this.restartRequestInfo));
    }

    private broadcastRestartNotRequested(client: Client, type: MessageInType): void {
        client.sendErrorMessage(ErrorType.RestartNotRequested, { type });
    }
}