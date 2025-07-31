// src/model/event.js

import mongoose from "mongoose";

const infoMatchSchema = new mongoose.Schema(
  {
    detail: String,
    usermatchjoined: Boolean,
    emailjoined: Boolean,
    email: String,
    chance: Number,
    usermatch: String, // Assuming this is a string field for user match
  },
  { timestamps: true }
);

export const InfoMatch = mongoose.model("InfoMatch", infoMatchSchema);