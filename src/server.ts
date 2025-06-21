import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import router from "./router/router";
import { runServer } from './lib/db';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server)

app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

app.use(router);










