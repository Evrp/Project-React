// src/model/event.js

import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: String,
  genre: String,
  location: String,
  date: String,
  description: String,
  imageUrl: String,
  link: String,
  createdByAI: Boolean
});

export const Event = mongoose.model("Event", eventSchema);
