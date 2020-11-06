import { IncomingHttpHeaders } from "http";
import { CONFIG } from "../../config/config";

export class ConnectionGuard {

    public static authenticatedClient(headers: IncomingHttpHeaders): boolean {
        return ConnectionGuard.originIsAllowed(headers) && ConnectionGuard.correctProtocols(headers);
    }

    private static originIsAllowed(headers: IncomingHttpHeaders): boolean {
        console.log(headers.origin, CONFIG.ALLOWED_HOST);

        const origin = headers.origin;
        return origin === CONFIG.ALLOWED_HOST;
    }

    private static correctProtocols(headers: IncomingHttpHeaders): boolean {
        const protocols = [CONFIG.SOCKET_PROTOCOL, CONFIG.APP_PROTOCOL];
        const requestProtocols = ConnectionGuard.getProtocols(headers);
        return protocols.every(protocol => requestProtocols.includes(protocol));
    }

    private static getProtocols(headers: IncomingHttpHeaders): string[] {
        const reqStringProtocol = headers['sec-websocket-protocol'];
        if (typeof reqStringProtocol === 'string') {
            return !reqStringProtocol ? [] : reqStringProtocol.split(',').map(s => s.trim());
        } else {
            return reqStringProtocol;
        }
    }

}
