import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  displayName: String,
  email: { type: String, unique: true },
  photoURL: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model("User", userSchema);
