import express, { Request, Response } from 'express';
import { CONFIG } from './config/config';
import { OnlineGamingApp } from './app/online-gaming-app';
import { Socket } from 'net';
import { IncomingMessage } from 'http';
import { ConnectionHelper } from './app/connection-helper';

const port = CONFIG.PORT;
const OnlineGaming = new OnlineGamingApp();

const app = express();

let startedAt: Date;

app.get('/', async (req: Request, res: Response, next) => {
  res.json({
    API: 'Onlie Gaming API',
    poweredBy: 'Katerina Tziala',
    startedAt,
    info: OnlineGaming.info
  });
});

const server = app.listen(port, () => {
  startedAt = new Date();
  console.log(`Server is listening on port ${port}!`);
});

server.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
  if (ConnectionHelper.connectionAllowed(request)) {
    OnlineGaming.onOriginConnection(request, socket, head);
  } else {
    socket.end();
  }
});
