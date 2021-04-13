import express, { Request, Response } from 'express';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { ConnectionHelper } from './app/connection-helper';
import { OnlineGamingApp } from './app/online-gaming-app';
import { CONFIG } from './config/config';

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
  console.log(`Server is listening on port ${port}...`);
});

server.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
  if (ConnectionHelper.connectionAllowed(request)) {
    OnlineGaming.onOriginConnection(request, socket, head);
  } else {
    socket.end();
  }
});
