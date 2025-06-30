// src/model/event.js

import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: String,
    email: String,
  },
  { timestamps: true }
);

export const EventMatch = mongoose.model("EventMatch", eventSchema);
