import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import {User} from "../models/user.model";
import { IGetUserAuthInfoRequest } from "../types/express";

const protectedRoute = async (
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        error: "Unauthorized - no token valid",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (!decoded) {
      return res.status(401).json({
        error: "Unauthorized - invalid token",
      });
    }
    const idUser = decoded.userId || "";
    const user = await User.findById(idUser).select("-password");
    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }
    req.user = user
    next();
  } catch (error) {
    console.log("Error in protected route");
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default protectedRoute