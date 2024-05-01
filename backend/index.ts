import express from "express";
import cors from "cors"; // Importa el middleware cors
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.routes";
import messageRoutes from "./src/routes/message.routes";
import cookieParser from "cookie-parser";
import connectToMongoDB from "./src/db/connectiondb";
import userRoutes from "./src/routes/user.routes";
import { app, server } from "./socket/socket";
dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost",
  "http://127.0.0.1",
  "http://18.224.59.40",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://18.224.59.40:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite las solicitudes de cualquier origen si es un origen permitido
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Habilita el envío de cookies de autenticación
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
