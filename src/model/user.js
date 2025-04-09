import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  interest: String,
  location: String,
  date: String,
  budget: String,
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model("User", UserSchema);
