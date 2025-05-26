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
    joinedRooms: [String], // เปลี่ยนจาก rooms เป็น joinedRooms และเก็บ roomId เป็น array
  },
  { timestamps: true }
);
infoSchema.statics.joinRoom = async function (userEmail, roomId) {
  const user = await this.findOne({ email: userEmail });

  if (!user) throw new Error("User not found");

  if (!user.joinedRooms.includes(roomId)) {
    user.joinedRooms.push(roomId);
    await user.save();
  }

  return user;
};

  export const Info = mongoose.model("Info", infoSchema);
