import express from "express";
import { EventMatch } from "../src/model/eventmatch.js";
import { InfoMatch } from "../src/model/infomatch.js";
const router = express.Router();

router.post("/events-match", async (req, res) => {
  const { title, email, roomId, usermatch, chance } =
    req.body;

  try {
    if (!title || !email || !roomId || !usermatch || !chance) {
      return res.status(400).json({ error: "Title, email, roomId, chance and usermatch are required." });
    }

    const newEvent = new InfoMatch({
      title,
      email,
      roomId,
      chance,
      usermatch, // Assuming this is a string field for user match
    });

    await newEvent.save();
    res.status(201).json({ message: "Event saved", event: newEvent });
  } catch (error) {
    console.error("❌ Error saving event:", error);
    res.status(500).json({ message: "Failed to save event" });
  }
});

router.get("/events-match/:email", async (req, res) => {
  try {
    const events = await EventMatch.find({ email: req.params.email }); // เรียงตามวันที่
    res.json(events);
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
})
router.delete("/delete-all-events-match", async (req, res) => {
  try {
    await EventMatch.deleteMany({}); // ลบทุกเอกสารใน collection
    res.status(200).json({ message: "ลบกิจกรรมทั้งหมดเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("❌ Error deleting events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ลบ event match เฉพาะห้องที่ระบุ
router.delete("/delete-event-match/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const result = await EventMatch.deleteOne({ roomId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Event match not found" });
    }
    res.status(200).json({ message: "ลบ event match เรียบร้อยแล้ว" });
  } catch (error) {
    console.error("❌ Error deleting event match:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;