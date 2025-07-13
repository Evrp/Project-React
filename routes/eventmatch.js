import express from "express";
import { EventMatch } from "../src/model/eventmatch.js";
const router = express.Router();

router.post("/save-event-match", async (req, res) => {
  const { title, isFirst, email, roomId, usermatch } =
    req.body;

  try {
    if (isFirst) {
      const deleted = await EventMatch.deleteMany({});
      console.log("🧹 Deleted all events:", deleted.deletedCount);
    }

    const newEvent = new EventMatch({
      title,
      email,
      roomId,
      usermatch, // Assuming this is a string field for user match
    });

    await newEvent.save();
    res.status(201).json({ message: "Event saved", event: newEvent });
  } catch (error) {
    console.error("❌ Error saving event:", error);
    res.status(500).json({ message: "Failed to save event" });
  }
});

router.get("/events-match", async (req, res) => {
  try {
    const events = await EventMatch.find({}); // เรียงตามวันที่
    res.json(events);
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
})
router.delete("/api/delete-all-events-match", async (req, res) => {
  try {
    await EventMatch.deleteMany({}); // ลบทุกเอกสารใน collection
    res.status(200).json({ message: "ลบกิจกรรมทั้งหมดเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("❌ Error deleting events:", error);
    res.status(500).json({ message: "Server error" });
  }
})

export default router;