import { IncomingHttpHeaders, IncomingMessage } from "http";
import { CONFIG } from "../config/config";

export class ConnectionHelper {

    public static connectionAllowed(request: IncomingMessage): boolean {

        const requestProtocols = this.getProtocols(request.headers);
        if (!requestProtocols || !requestProtocols.length) {
            return false;
        }
        return this.correctProtocols(requestProtocols);
    }

    public static getUserIdFromURL(request: IncomingMessage): string {
        const urlParts = request.url.split('user=');
        return request.headers.userId = urlParts.length > 1 ? urlParts.pop().trim() : undefined;
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
