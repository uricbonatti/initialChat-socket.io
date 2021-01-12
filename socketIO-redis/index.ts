import { Server, Socket } from "socket.io";
import express from "express";
import http from "http";
import redis from "redis";
import secret from "./secret";
import { promisify } from "util";

interface Message {
  text: string;
  date: Date;
  key: string;
  image?: string;
}

const app = express();

const PORT = process.env.PORT || 4040;

const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

const client = redis.createClient(secret);

const redisGetAsync = promisify(client.get).bind(client);

io.on("connect", (ioSocket: Socket) => {
  ioSocket.on("joinRoom", async (key: string) => {
    ioSocket.join(key);
    const messageData = await redisGetAsync(key);
    //need to make syre we are grabbing this history data on the frontend
    ioSocket.emit("history", messageData);
  });

  ioSocket.on("message", (message: Message) => {
    //save message
    saveMessage(message);
    //for everyone in the room including me
    ioSocket.nsp.to(message.key).emit("message", message);
  });
});

const saveMessage = async (message: Message) => {
  const { key } = message;
  const data = await redisGetAsync(key);
  if (!data) {
    return client.set(key, "[]");
  }
  const json = JSON.parse(data);
  json.push(message);
  client.set(key, JSON.stringify(json));
};

server.listen(PORT, () => console.log(PORT));
