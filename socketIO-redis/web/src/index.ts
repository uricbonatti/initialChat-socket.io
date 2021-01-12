import { io } from "socket.io-client";

interface Message {
  text: string;
  date: Date;
  key: string;
  image?: string;
}

const socket = io("http://localhost:4040");

const KEY = "1";

socket.emit("joinRoom", KEY);
socket.on("message", (message: Message) => console.log(message));

const btn = document.querySelector("button");
btn?.addEventListener("click", () => {
  socket.emit("message", {
    text: "Test",
    date: new Date(),
    key: KEY,
  });
});
