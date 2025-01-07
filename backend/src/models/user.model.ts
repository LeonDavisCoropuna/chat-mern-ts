import mongoose, { Document, ObjectId } from "mongoose";

export interface IUser extends Document {
  _id: ObjectId; // Definir explícitamente el tipo de _id
  fullname: string;
  username: string;
  password: string;
  gender: "male" | "female";
  profilePicture: string;
}


const userSchema = new mongoose.Schema<IUser>({
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
