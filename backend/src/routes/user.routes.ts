import express from "express";
import { getUsersForSidebar } from "../controllers/user.controller";
import protectedRoute from "../middleware/protectedRoute";

const router = express.Router();

router.get("/", protectedRoute, getUsersForSidebar);
export default router;
