import { IncomingHttpHeaders, IncomingMessage } from "http";
import { CONFIG } from "../config/config";

export class ConnectionGuard {

    public static connectionAllowed(request: IncomingMessage): boolean {
        const requestProtocols = this.getProtocols(request.headers);
        if (!requestProtocols || !requestProtocols.length) {
            return false;
        }
        return this.correctProtocols(requestProtocols);
    }

    private static correctProtocols(requestProtocols: string[]): boolean {
        const requiredProtocols = CONFIG.PROTOCOLS;
        if (requestProtocols.length !== requiredProtocols.length) {
            return false;
        }
        return requestProtocols.every(protocol => requiredProtocols.includes(protocol));
    }

    private static getProtocols(headers: IncomingHttpHeaders): string[] {
        const reqStringProtocol = headers["sec-websocket-protocol"];
        if (typeof reqStringProtocol === "string") {
            return this.extractProtocolsFromString(reqStringProtocol);
        } else {
            return reqStringProtocol;
        }
    }

    private static extractProtocolsFromString(reqStringProtocol: string): string[] {
        if (!reqStringProtocol) {
            return [];
        }
        return reqStringProtocol.split(",").map(protocol => protocol.trim());
    }

}
