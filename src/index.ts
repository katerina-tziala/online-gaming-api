import express from 'express';
import http, { IncomingMessage } from 'http';
import { CONFIG } from './config/config';
import * as WebSocket from 'ws';
import { Client } from './app/client/client';
import { OnlineGamingApp } from './app/online-gaming-app';
import { MovesCollectionHandler } from './app/game/moves-collection/moves-collection.handler';

const port = CONFIG.PORT;
const server = http.createServer(express);
const wss = new WebSocket.Server({ server });
const OnlineGaming = new OnlineGamingApp();

wss.on('connection', (conn: WebSocket, request: IncomingMessage) => {
  // console.log(conn, request);
  // console.log(wss.clients);
  // const clientOrigin = request.headers.origin;
  // console.log('clientOrigin:', clientOrigin);
  const client = new Client(conn);


  conn.on('message', (msg: string) => OnlineGaming.onMessage(client, msg));

  conn.on('close', () => OnlineGaming.disconnect(client));
});

wss.on('error', (event) => {
  console.log('websocket error');
  console.log(event);
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}!`);
});
