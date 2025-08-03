// src/model/event.js

import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: String,
    email: String,
    usermatchjoined: Boolean,
    emailjoined: Boolean,
    chance: Number,
    usermatch: String, // Assuming this is a string field for user match
  },
  { timestamps: true }
);

export const EventMatch = mongoose.model("EventMatch", eventSchema);
