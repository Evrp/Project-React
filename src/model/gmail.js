import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    displayName: String,
    email: { type: String, unique: true },
    photoURL: String,
  },
  { timestamps: true }
);

export const Gmail = mongoose.model("gmails", userSchema);
