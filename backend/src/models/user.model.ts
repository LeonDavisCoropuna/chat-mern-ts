import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  fullname: string;
  username: string;
  password: string;
  gender: "male" | "female";
  profilePicture: string;
}

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female"],
  },
  profilePicture: {
    type: String,
    default: "",
  },
});

export const User = mongoose.model<IUser>("User", userSchema);
