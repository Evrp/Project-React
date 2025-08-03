import express from "express";
import { Event } from "../src/model/event.js";
import { EventMatch } from "../src/model/eventmatch.js";
import { Filter } from "../src/model/filter.js";
import { Gmail } from "../src/model/gmail.js";
import { ImageGenre } from "../src/model/image.js";
const router = express.Router();

// Save event
router.post("/save-event", async (req, res) => {
    const { title, genre, location, date, description, link, isFirst, email } = req.body;
    try {
        if (isFirst) {
            await Event.deleteMany({});
        }
        const newEvent = new Event({ title, genre, location, date, description, link, createdByAI: true, email });
        await newEvent.save();
        res.status(201).json({ message: "Event saved", event: newEvent });
    } catch (error) {
        res.status(500).json({ message: "Failed to save event" });
    }
});

// Save event match
router.post("/save-event-match", async (req, res) => {
    const { title, isFirst, email, image } = req.body;
    try {
        if (isFirst) {
            await EventMatch.deleteMany({});
        }
        const newEvent = new EventMatch({ title, email, image });
        await newEvent.save();
        res.status(201).json({ message: "Event saved", event: newEvent });
    } catch (error) {
        res.status(500).json({ message: "Failed to save event" });
    }
});

// Get event match
router.get("/events-match", async (req, res) => {
    try {
        const events = await EventMatch.find({});
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Delete all event match
router.delete("/delete-all-events-match", async (req, res) => {
    try {
        await EventMatch.deleteMany({});
        res.status(200).json({ message: "ลบกิจกรรมทั้งหมดเรียบร้อยแล้ว" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get filter by email
router.get("/filters/:email", async (req, res) => {
    try {
        const filter = await Filter.findOne({ email: req.params.email });
        res.json(filter || null);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get events by user
router.get("/events", async (req, res) => {
    const email = req.query.email;
    try {
        const events = await Event.find({ email }).sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get all events
router.get("/all-events", async (req, res) => {
    try {
        const events = await Event.find({});
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Delete event by id
router.delete("/detele-events/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Event.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.json({ message: "Event deleted", deleted });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
});

// Delete all events by user
router.delete("/delete-all-events/:email", async (req, res) => {
    const userEmail = req.params.email;
    try {
        await Event.deleteMany({ email: userEmail });
        res.status(200).json({ message: "ลบกิจกรรมทั้งหมดเรียบร้อยแล้ว" });
    } catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบกิจกรรม" });
    }
});

// Save image
router.post("/save-image", async (req, res) => {
    const { image, genres } = req.body;
    if (!image || !genres) {
        return res.status(400).json({ error: "ต้องมีทั้ง image และ genres เป็น array" });
    }
    try {
        const newImageGenre = new ImageGenre({ image, genres });
        await newImageGenre.save();
        res.status(200).json({ message: "บันทึกข้อมูลสำเร็จ", data: newImageGenre });
    } catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึก" });
    }
});

// Get image genres
router.get("/get-image-genres", async (req, res) => {
    try {
        const imageGenres = await ImageGenre.find();
        res.status(200).json({ imageGenres });
    } catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
});

// Friend match
router.get("/matches/:email", async (req, res) => {
    const { email } = req.params;
    try {
        const user = await Filter.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        const matches = await Filter.find({ email: { $ne: email }, genres: { $in: user.genres } });
        const matchEmails = matches.map((m) => m.email);
        const gmailUsers = await Gmail.find({ email: { $in: matchEmails } });
        const combinedMatches = matches.map((match) => {
            const gmailUser = gmailUsers.find((g) => g.email === match.email);
            return {
                ...match.toObject(),
                displayName: gmailUser?.displayName || "",
                photoURL: gmailUser?.photoURL || "",
            };
        });
        res.json(combinedMatches);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
