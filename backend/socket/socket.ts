import { Server, Socket } from "socket.io";
import http from "http";
import express, { Application } from "express";

const app: Application = express();

const server: http.Server = http.createServer(app);
const io: Server = new Server(server, {
  cors: {
    origin: ["http://frontend:3000"], 
    methods: ["POST", "GET"],
  },
});

export const getReciverSocketId = (receiverId: string) => {
  return userSocketMap[receiverId]
}

const userSocketMap: { [key: string]: string } = {}; //{userId, socketId}
io.on("connection", (socket: Socket) => {
  console.log("A user connected", socket.id);
  const userId: string | string[] | undefined = socket.handshake.query.userId;

  if (typeof userId === "string") {
    // Si userId es un string, puedes asignarlo directamente a userSocketMap
    userSocketMap[userId] = socket.id;
  } else if (Array.isArray(userId)) {
    // Si userId es un array de strings, puedes iterar sobre él y asignar cada elemento a userSocketMap
    userId.forEach((id) => {
      userSocketMap[id] = socket.id;
    });
  }
  console.log(userSocketMap)
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  socket.on("disconnect", () => {
    //console.log("A user disconnected", socket.id);
    if (typeof userId === "string") delete userSocketMap[userId];
    console.log(userSocketMap)

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
export { app, io, server };
