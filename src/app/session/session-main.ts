import { CONFIG } from "../../config/config";
import { Client } from "../utilities/client";

import { Session } from "./session";

export class MainSession extends Session {

    constructor() {
        super();
        this.id = CONFIG.APP_PROTOCOL;
    }

    public addClient(client: Client): void {
        super.addClient(client);
        this.broadcastSession();
    }

    public removeClient(client: Client): void {
        super.removeClient(client);
        if (this.hasClients) {
            this.broadcastSession();
        }
    }

    public broadcastSession(): void {
        const clients = this.clientsList;
        clients.forEach(client => {
            client.sendMessage({
                type: "broadcasr",
                data: {
                    client: client.details,
                    peers: this.getPeersDetailsOfClient(client)
                }
            });
        });

    }


}