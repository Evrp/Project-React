import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    displayName: String,
    email: { type: String, unique: true },
    photoURL: String,
    friends: [{ type: String }],
    following: [String],
    followers: [String],
  },
  { timestamps: true } // เพื่อให้มี createdAt / updatedAt
);

export const Gmail = mongoose.model("gmails", userSchema);
