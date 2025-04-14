import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    displayName: String,
    email: { type: String, unique: true },
    photoURL: String,
  },
  { timestamps: true } // เพื่อให้มี createdAt / updatedAt
);

export const Gmail = mongoose.model("Gmail", userSchema);
