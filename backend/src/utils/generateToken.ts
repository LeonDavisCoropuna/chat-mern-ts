import { Response } from "express";
import jwt from "jsonwebtoken";
import mongoose, { ObjectId } from "mongoose";
const generateTokenAndSetCookie = (userId: ObjectId, res: Response) => {
  const token = jwt.sign({userId}, process.env.JWT_SECRET!, {
    expiresIn: "15d",
  });
  res.cookie("jwt", token, {
    maxAge: 30 * 24 * 60 * 60 * 100,
    httpOnly: true,
    sameSite: "strict",
    secure: false
  });
};

export default generateTokenAndSetCookie