import { Response } from "express";
import { User } from "../models/user.model";
import { IGetUserAuthInfoRequest } from "../types/express";

export const getUsersForSidebar = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  try {
    const loggedInUserId = req.user?._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    return res.status(200).json(filteredUsers);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
