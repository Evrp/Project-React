import mongoose from "mongoose";

const userPhotoSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true
  },
  filename: String,
  title: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const UserPhoto = mongoose.model("UserPhoto", userPhotoSchema);
