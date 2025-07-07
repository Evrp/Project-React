// models/Like.js
import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    eventTitle: { type: String },
    likedAt: { type: Date, default: Date.now }
});

export const Like = mongoose.model("Like", likeSchema);
