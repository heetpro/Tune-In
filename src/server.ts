import express from 'express';
import http from 'http';
import cors from 'cors';
import router from "./router/router";
import { runServer } from './lib/db';
import { createClient } from "redis";
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';











