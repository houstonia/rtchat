import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import SocketHandler from "./socketHandler";
import UsersService from "./userService";


const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(cors({ origin: "*" }));

app.get("/", (_, res) => res.send("Hello world!"));

const usersService = new UsersService();
new SocketHandler(io, usersService);

server.listen(5000, () => console.log("Server is running on port 5000"));
