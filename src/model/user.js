// src/model/user.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: String,
  displayName: String,
  photoURL: String,
  following: [String],
  followers: [String],
});

export const User = mongoose.model("users", userSchema);
