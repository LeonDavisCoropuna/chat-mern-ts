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

// Accede a la variable de entorno FRONTEND_URL
const allowedOrigins = [
  process.env.FRONTEND_URL ?? "http://localhost",
  // Puedes agregar más orígenes si es necesario
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Si usas cookies
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
  console.log(`front url: ${process.env.FRONTEND_URL}`)
});
