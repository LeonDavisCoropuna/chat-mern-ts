import { Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const generateTokenAndSetCookie = (userId: mongoose.Types.ObjectId, res: Response) => {
  const token = jwt.sign({userId}, process.env.JWT_SECRET!, {
    expiresIn: "15d",
  });
  res.cookie("jwt", token, {
    maxAge: 30 * 24 * 60 * 60 * 100,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development"
  });
};

export default generateTokenAndSetCookie