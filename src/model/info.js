// src/model/info.js

import mongoose from "mongoose";

const infoSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    userInfo: {
      detail: String,
      description: String,
      extra: String,
    },
    rooms: {
      name: String,
      image: String,
      description: String,
      createdBy: String, // ชื่อหรืออีเมลของผู้สร้าง
      createdAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

export const Info = mongoose.model("Info", infoSchema);
