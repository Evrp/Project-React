import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  roomId: String,
  createdBy: String, // ชื่อหรืออีเมลของผู้สร้าง
  createdAt: { type: Date, default: Date.now },
});

export const Room = mongoose.model("Room", roomSchema);
