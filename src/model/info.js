// src/model/info.js

import mongoose from "mongoose";

const infoSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  userInfo: {
    detail: String,
    description: String,
    extra: String,
  },
});

export const Info = mongoose.model("Info", infoSchema);
