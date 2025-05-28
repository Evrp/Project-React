import mongoose from "mongoose";
const infoSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    userInfo: {
      detail: String,
      description: String,
      extra: String,
    },
    joinedRooms: [{
      roomId: { type: String, required: true },
      roomName: { type: String, required: true }
    }]

    // เปลี่ยนจาก rooms เป็น joinedRooms และเก็บ roomId เป็น array
  },
  { timestamps: true }
);

// Static method to join a room
infoSchema.statics.joinRoom = async function (userEmail, roomId, roomName) {
  const user = await this.findOne({ email: userEmail });
  console.log("teset", userEmail, roomId, roomName);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404; // Not Found
    throw error;
  }

  // Ensure user.joinedRooms is an array
  // This prevents errors if the field is missing or not an array on an existing document
  if (!Array.isArray(user.joinedRooms)) {
    user.joinedRooms = [];
  }

  const alreadyJoined = user.joinedRooms.some(room => room.roomId === roomId);
  if (alreadyJoined) {
    console.log(`User ${userEmail} already in room ${roomId}.`);
    return user;
  }

  user.joinedRooms.push({ roomId, roomName });
  await user.save(); // This will still trigger a validation error if pre-existing data in joinedRooms is invalid
  return user;
};

export const Info = mongoose.model("Info", infoSchema);