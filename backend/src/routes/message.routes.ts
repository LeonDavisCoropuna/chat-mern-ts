import express from "express";
import { getMessages, sendMessage } from "../controllers/message.controller";
import protectedRoute from "../middleware/protectedRoute";

const router = express.Router();

router.post("/send/:id", protectedRoute, sendMessage);
router.post("/:id", protectedRoute, getMessages);

export default router;
