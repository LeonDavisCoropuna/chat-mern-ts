import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcryptjs from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateToken";
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    console.log(username + "  " + password)
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcryptjs.compare(
      password,
      user?.password || ""
    );
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({
        error: "Invalid password or username",
      });
    }
    generateTokenAndSetCookie(user._id, res);
    return res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server Error" });
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logget out successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server Error" });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { fullname, username, password, confirmPassword, gender } = req.body;
    if (password != confirmPassword) {
      return res.status(400).json({ error: "Password don't match" });
    }
    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hanshedPassword = await bcryptjs.hash(password, salt);

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = new User({
      fullname,
      password: hanshedPassword,
      gender,
      username,
      profilePicture: gender === "male" ? boyProfilePic : girlProfilePic,
    });
    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullname,
        username: newUser.username,
        profilePicture: newUser.profilePicture,
      });
    } else {
      return res.status(400).json({ error: "Invalid Data" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server Error" });
  }
};
