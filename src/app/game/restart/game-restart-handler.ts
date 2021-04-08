import { MessageInType, MessageOutType } from "../../messages/message-types/message-types.enum";
import { Client } from "../../client/client";
import { ClientData } from "../../client/client-data.interface";
import { ClientsController } from "../../controllers/clients-controller";
import { GameRestart } from "./game-restart.interfaces";


export class GameRestartHandler {
    private _messageHandlingConfig: Map<string, (client: Client, peers?: Client[]) => void> = new Map();
    private id: string;
    private _PlayersExpectedToConfirmController: ClientsController;
    private _PlayersConfirmedController: ClientsController;
    private _requestedBy: Client;
    private _createdAt: string;

    constructor(id: string) {
        this.id = id;
        this.setMessageHandling();
        this.init();
    }

    private get playersConfirmed() {
        return this._PlayersConfirmedController.clientsInfo;
    }

    private get playersExpectedToConfirm(): ClientData[] {
        return this._PlayersExpectedToConfirmController.clientsInfo;
    }

    private get restartRequestInfo(): GameRestart {
        return {
            gameId: this.id,
            createdAt: this._createdAt,
            requestedBy: this._requestedBy.info,
            confirmedBy: this.playersConfirmed,
            expectedToConfirm: this.playersExpectedToConfirm
        }
    }

    private setMessageHandling(): void {
        this._messageHandlingConfig.set(MessageInType.GameRestart, this.onGameRestart.bind(this));
        this._messageHandlingConfig.set(MessageInType.GameRestartCancel, this.onRestartCancel.bind(this));
        this._messageHandlingConfig.set(MessageInType.GameRestartAccept, this.onRestartAccept.bind(this));
        this._messageHandlingConfig.set(MessageInType.GameRestartReject, this.onRestartReject.bind(this));
    }

    private onGameRestart(client: Client, peers: Client[]): void {
        if (this._createdAt) {
            // check if players can restart the game
            console.log("already requested");
            console.log("onGameRestart");
            console.log(client.info);
            console.log(this.restartRequestInfo);
        } else {
            this.createRestartRequest(client, peers);
        }
    }

    private createRestartRequest(client: Client, peers: Client[]): void {
        this._PlayersExpectedToConfirmController.clients = peers;
        this._createdAt = new Date().toString();
        this._requestedBy = client;
        this.broadcastRequestToClients(this._PlayersExpectedToConfirmController.clients, MessageOutType.GameRestartRequested);
    }


    private onRestartCancel(client: Client): void {
        console.log("onRestartCancel");
        console.log(client.info);

    }

    private onRestartAccept(client: Client): void {
        console.log("onRestartAccept");
        console.log(client.info);

    }

    private onRestartReject(client: Client): void {
        console.log("onRestartReject");
        console.log(client.info);

    }


    public init(): void {
        this._PlayersExpectedToConfirmController = new ClientsController();
        this._PlayersConfirmedController = new ClientsController();
        this._createdAt = undefined;
        this._requestedBy = undefined;
        console.log("init");

    }

    public onMessage(client: Client, type: MessageInType, peers?: Client[]): void {
        if (this._messageHandlingConfig.has(type)) {
            this._messageHandlingConfig.get(type)(client, peers);
        }
    }

    // MESSAGE BROADCAST
    private broadcastRequestToClients(clients: Client[], type: MessageOutType): void {
        clients.forEach((client) => client.sendMessage(type, this.restartRequestInfo));
    }

}