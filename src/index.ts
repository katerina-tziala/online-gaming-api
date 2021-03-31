import express from 'express';
import http, { IncomingMessage } from 'http';
import { CONFIG } from './config/config';
import * as WebSocket from 'ws';
import { Client } from './app/client/client';

const port = CONFIG.PORT;
const server = http.createServer(express);
const wss = new WebSocket.Server({ server });

wss.on('connection', (conn: WebSocket, request: IncomingMessage) => {
  // console.log(conn.readyState);
  // console.log(conn, request);
  // console.log(wss.clients);

  // const clientOrigin = request.headers.origin;
  // console.log('clientOrigin:', clientOrigin);

  const client = new Client(conn);
  console.log(client.info);
  client.sendUserInfo();


  conn.on('message', (msg: string) => {
    console.log(msg);
  });

  conn.on('close', (ev) => {
    console.log('close', ev);
  });
});

wss.on('error', (event) => {
  console.log('websocket error');
  console.log(event);
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}!`);
});
