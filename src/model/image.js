// models/ImageGenre.js

import mongoose from "mongoose";

const imageGenreSchema = new mongoose.Schema({
  image: {
    type: String, // สามารถเป็น URL หรือ base64 ก็ได้
    required: true,
  },
  genres: {
    type: String, 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const ImageGenre = mongoose.model("ImageGenre", imageGenreSchema);
