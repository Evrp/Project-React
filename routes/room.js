import express from "express";
import { Room } from "../src/model/room.js";
import { Info } from "../src/model/info.js";
const router = express.Router();

// Join community
router.post("/join-community", async (req, res) => {
  const { userEmail, roomId, roomName } = req.body;
  if (!userEmail || !roomId || !roomName) {
    return res.status(400).json({ error: "userEmail and roomId are required." });
  }
  try {
    const updatedUser = await Info.findOneAndUpdate(
      { email: userEmail },
      { $push: { joinedRooms: { roomId, roomName } } },
      { new: true, runValidators: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user rooms
router.get("/user-rooms/:email", async (req, res) => {
  const encodedEmail = req.params.email.toLowerCase();
  try {
    const user = await Info.findOne({ email: encodedEmail });
    if (!user) return res.status(404).json({ error: "User not found" });
    const roomIds = user.joinedRooms.map((room) => room.roomId);
    const roomNames = user.joinedRooms.map((room) => room.roomName);
    res.status(200).json({ roomNames, roomIds });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// Create room
router.post("/createroom", async (req, res) => {
  try {
    const { name, image, description, createdBy, roomId } = req.body;
    const room = new Room({ name, image, description, createdBy, roomId });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

// Get all rooms
router.get("/allrooms", async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

// Delete multiple rooms
router.post("/delete-rooms", async (req, res) => {
  const { selectedRooms } = req.body;
  if (!Array.isArray(selectedRooms) || selectedRooms.length === 0) {
    return res.status(400).json({ message: "No room IDs provided" });
  }
  try {
    const deletedRooms = await Room.deleteMany({ _id: { $in: selectedRooms } });
    const result = await Info.updateMany(
      {},
      { $pull: { joinedRooms: { roomId: { $in: selectedRooms } } } }
    );
    res.json({
      message: "Rooms deleted and removed from user joinedRooms",
      deletedCount: deletedRooms.deletedCount,
      updatedUsers: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// Delete joined room
router.delete("/delete-joined-rooms/:roomName/:userEmail", async (req, res) => {
  const { roomName, userEmail } = req.params;
  try {
    const room = await Room.findOne({ name: roomName });
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    const roomId = room._id.toString();
    const result = await Info.updateOne(
      { email: userEmail },
      {
        $pull: {
          joinedRooms: {
            $or: [
              { roomId: roomId },
              { roomName: roomName },
            ],
          },
        },
      }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "User or room not found in joinedRooms" });
    }
    res.json({ success: true, message: "Room removed from user's joinedRooms", roomName, userEmail });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed", error: err.message });
  }
});

export default router;
