
// import express from 'express';
// import http, { IncomingMessage } from 'http';
// import { CONFIG } from './config/config';
// import * as WebSocket from 'ws';

// const port = CONFIG.PORT;
// const server = http.createServer(express);
// const wss = new WebSocket.Server({ server });
// // const server = new WebSocket.Server({ port: CONFIG.PORT });
// // console.log(`Server is listening on port ${CONFIG.PORT}:)`);

// wss.on('connection', (conn: WebSocket, request: IncomingMessage) => {

//   console.log(conn, request);
//   console.log(wss.clients);
//     const clientOrigin = request.headers.origin;
//     console.log('clientOrigin:', clientOrigin);
//   // ws.on('message', function incoming(data) {
//   //   wss.clients.forEach(function each(client) {
//   //     if (client !== ws && client.readyState === WebSocket.OPEN) {
//   //       client.send(data);
//   //     }
//   //   })
//   // })
//     conn.on('message', (msg: string) => {
//       console.log(msg);

//     });

//     conn.on('close', (ev) => {
//       console.log('close', ev);

//     });
// });

// wss.on('error', (event) => {
//   console.log('websocket error');
//   console.log(event);
// });


// server.listen(port, () => {
//   console.log(`Server is listening on ${port}!`)
// });


// wss.on('connection', function connection(ws) {
//   // ws.on('message', function incoming(data) {
//   //   wss.clients.forEach(function each(client) {
//   //     if (client !== ws && client.readyState === WebSocket.OPEN) {
//   //       client.send(data);
//   //     }
//   //   })
//   // })
// });


// import express from 'express';
// import cors from 'cors';
// import http from 'http';
// import { CONFIG } from './config/config';
// // import { OnlineGamingAPI } from './app/app';
// import * as WebSocket from 'ws';
// import { IncomingMessage, Server } from 'http';
// import { GamingHost } from './app/utilities/gaming-host';
// import { Client } from './app/utilities/client';
// import { MessageIn } from './app/messages/message.interface';
// import { MessageInType, MessageOutType } from './app/messages/message-types.enum';

// const server = new WebSocket.Server({ port: CONFIG.PORT });
// console.log(`Server is listening on port ${CONFIG.PORT}:)`);

// // const GamingHosts = new Map();

// server.on('connection', (conn: WebSocket, connectionMessage: IncomingMessage) => {
//     // console.log('Connection established', connectionMessage);

//     const clientOrigin = connectionMessage.headers.origin;
//     console.log('clientOrigin:', clientOrigin);

//     // const gamingHost = 'gamingHost';
//     // const client = new Client(conn, gamingHost);

//     conn.on('message', (msg: string) => {
//       console.log(msg);

//     }
//       // messageHandler(client, JSON.parse(msg))
//     );

//     conn.on('close', (ev) => {
//       console.log('close', ev);

//     });
//   }
// );

// function setGamingHost(host: GamingHost) {
//   GamingHosts.set(host.id, host);
// }

// function getGamingHost(hostId: string): GamingHost {
//   if (!hostId) {
//     throw Error('no host id');
//   }
//   const selectedHost = GamingHosts.get(hostId);
//   if (!selectedHost) {
//     setGamingHost(new GamingHost(hostId));
//   }
//   return GamingHosts.get(hostId);
// }

// function getClientHost(client: Client): GamingHost {
//   if (!client) {
//     return;
//   }
//   return getGamingHost(client.host);
// }

// function messageHandler(client: Client, msg: MessageIn): void {
//   const { type } = msg;
//   msg.data = msg.data || {};
//   //
//   if (!client || !type || !msg.data) {
//     console.log('error on message');
//     // throw Error('error on message');
//     return;
//   }

//   if (type === MessageInType.Disconnect) {
//     disconnect(client);
//     return;
//   }
//   if (type === MessageInType.UserInfo) {
//     client.sendUserInfo();
//     return;
//   }

//   const host = getClientHost(client);
//   if (type === MessageInType.Join) {
//     host.onJoinClient(client, msg);
//    return;
//   }
//   host.onMessage(client, msg);
// }

// function disconnect(client: Client): void {
//   if (!client) {
//     return;
//   }
//   const host = getClientHost(client);
//   host.disconnectClient(client);
//   if (!host.hasClients) {
//     GamingHosts.delete(host.id);
//   }
// }
