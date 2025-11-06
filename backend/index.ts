import express from "express";
import cors from "cors"; // Importa el middleware cors
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.routes";
import messageRoutes from "./src/routes/message.routes";
import cookieParser from "cookie-parser";
import connectToMongoDB from "./src/db/connectiondb";
import userRoutes from "./src/routes/user.routes";
import { app, server } from "./socket/socket";
import { User } from "./src/models/user.model";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

// Accede a la variable de entorno FRONTEND_URL
const allowedOrigins = [
  process.env.FRONTEND_URL!
];

app.use(cors({
  origin: "*",  // permite cualquier origen
  credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Backend is running" });
});

app.get("/api/load-test", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    
    // Devolvemos el conteo para confirmar que funcionó
    res.status(200).json({ status: "ok", userCount });

  } catch (error: any) {
    console.error("Error en /api/load-test:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// En tu backend (app.ts) - Agrega esta ruta
app.get("/api/cpu-load", (req, res) => {
  const duration = parseInt(req.query.duration as string) || 5000; // 5 segundos por defecto
  const startTime = Date.now();
  
  console.log(`🔥 Iniciando carga de CPU por ${duration}ms`);
  
  // Carga intensiva de CPU (cálculos matemáticos)
  let result = 0;
  for (let i = 0; i < 1000000 * (duration / 1000); i++) {
    result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
  }
  
  const endTime = Date.now();
  const executionTime = endTime - startTime;
  
  res.status(200).json({
    status: "ok",
    message: `Carga de CPU completada`,
    duration: `${executionTime}ms`,
    result: result.toString().substring(0, 10) + "..." // Solo primeros 10 chars
  });
});

server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`[server]: Server is running at ${process.env.FRONTEND_URL}:${PORT}`);
  console.log(`front url: ${process.env.FRONTEND_URL}`)
});
