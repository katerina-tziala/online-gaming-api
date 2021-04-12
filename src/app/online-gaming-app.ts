import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { CONFIG } from '../config/config';
import { OnlineGamingHost } from './online-gaming-host';
import { ReportInfo } from './report-info.interface';

export class OnlineGamingApp {
  private _hosts: Map<string, OnlineGamingHost> = new Map();

  public get info(): ReportInfo[] {
    return Array.from(this._hosts.values()).map(host => host.info);
  }

  private get generatePort(): number {
    return CONFIG.PORT + this._hosts.size + 1;
  }

  private createWebSocket(origin: string) {
    const gamingHost = new OnlineGamingHost(origin, this.generatePort, this.onGamingHostClientsLeft.bind(this));
    this._hosts.set(origin, gamingHost);
    return gamingHost;
  }

  private getGamingHost(origin: string): OnlineGamingHost {
    if (this._hosts.has(origin)) {
      return this._hosts.get(origin);
    } else {
      return this.createWebSocket(origin)
    }
  }

  public onOriginConnection(request: IncomingMessage, socket: Socket, head: Buffer) {
    const origin = request.headers.origin;
    const gamingHost = this.getGamingHost(origin);
    gamingHost.handleUpgrade(request, socket, head);
  }

  public onGamingHostClientsLeft(origin: string): void {
    this._hosts.delete(origin);
  }

}
