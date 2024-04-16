import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.routes";
import messageRoutes from "./src/routes/message.routes";
import cookieParser from "cookie-parser";
import connectToMongoDB from "./src/db/connectiondb";
import userRoutes from "./src/routes/user.routes";
dotenv.config();
const PORT = process.env.PORT || 5000;
const app: Express = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
