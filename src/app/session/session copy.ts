// import { ClientInfo, UserData } from "./../interfaces/user-data.interface";
// import { generateId } from "../utilities/app-utils";
// import { Client } from "../utilities/client";
// import { MessageOutType } from "../messages/message-types.enum";

// export class Session {
//   public id: string;
//   public createdAt: string = null;
//   public _clients: Map<string, Client> = new Map();

//   constructor() {
//     this.id = generateId();
//     this.createdAt = new Date().toString();
//   }

//   public get hasClients(): boolean {
//     return !!this._clients.size;
//   }

//   public get clients(): Client[] {
//     return Array.from(this._clients.values());
//   }
//   public getClientPeers(client: Client): Client[] {
//     return this.clients.filter((peer) => peer.id !== client.id);
//   }

//   public clientExists(client: Client): boolean {
//     return this._clients.has(client.id);
//   }

//   public removeFromClients(client: Client): void {
//     if (this.clientExists(client)) {
//       this._clients.delete(client.id);
//     }
//   }

//   public addInClients(client: Client): void {
//     this.removeFromClients(client);
//     this._clients.set(client.id, client);
//   }

//   public getPeersDetailsOfClient(client: Client): ClientInfo[] {
//     return this.getClientPeers(client).map((peer) => peer.info);
//   }

//   public findClientById(clientId: string): Client {
//     return this._clients.get(clientId);
//   }

//   //   private getAvailablePeers(client: Client): Client[] {
//   //     const peers = this.getClientPeers(client);
//   //     return peers.filter(peer => !peer.gameRoomId);
//   //   }

//   //   public notifyJoinedUser(client: Client): void {
//   //     const data = {
//   //       user: client.info,
//   //       peers: this.getPeersDetailsOfClient(client)
//   //     };
//   //     client.notify(MessageOutType.Joined, data);
//   //   }

//   //  public broadcastPeersUpdate(joinedClient: Client): void {
//   //     const clientsToReceiveBroadcast = this.getAvailablePeers(joinedClient);
//   //     clientsToReceiveBroadcast.forEach((client) => {
//   //       const peers = this.getPeersDetailsOfClient(client);
//   //       client.notify(MessageOutType.Peers, {peers});
//   //     });
//   //   }

//   // private get availableClients(): Client[] {
//   //   return this.clients.filter(client => !client.gameRoomId);
//   // }
//   // public get clientsMap(): Map<string, Client> {
//   //   return this._clients;
//   // }
//   // public get hasClients(): boolean {
//   //   return this.clientsMap && this.clientsMap.size ? true : false;
//   // }
//   // public get clientsList(): Client[] {
//   //   return getArrayFromMap(this.clientsMap);
//   // }

//   // public getClients(ids: string[]): Client[] {
//   //   return this.clientsList.filter(client => ids.includes(client.id));
//   // }
//   // public getClientPeers(client: Client): Client[] {
//   //   return this.clientsList.filter((peer) => peer.id !== client.id);
//   // }
//   // public getPeersDetailsOfClient(client: Client): UserData[] {
//   //   return this.getClientPeers(client).map((peer) => peer.details);
//   // }
// }
