import express from "express";
import { Like } from "../src/model/like.js"; // Import the Like model
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
// Route to like an event
// POST /like
app.post("/like", async (req, res) => {
    const { userEmail, eventId, eventTitle } = req.body;

    try {
        const existing = await Like.findOne({ userEmail, eventId });
        if (existing) return res.status(400).json({ message: "Already liked." });

        const like = new Like({ userEmail, eventId, eventTitle });
        await like.save();

        res.json({ message: "Liked!" });
    } catch (err) {
        res.status(500).json({ message: "Error", error: err.message });
    }
});
// Route to get all likes by user
// GET /likes/:userEmail
app.get("/likes/:userEmail", async (req, res) => {
    const { userEmail } = req.params;

    try {
        const likes = await Like.find({ userEmail });
        res.json(likes);
    } catch (err) {
        res.status(500).json({ message: "Error fetching likes", error: err.message });
    }
});
// Route to get all likes
// GET /likes
app.get("/likes", async (req, res) => {
    try {
        const likes = await Like.find();
        res.json(likes);
    } catch (err) {
        res.status(500).json({ message: "Error fetching likes", error: err.message });
    }
});
// Route to unlike an event
// DELETE /unlike/:userEmail/:eventId   
app.delete("/like/:userEmail/:eventId", async (req, res) => {
    const { userEmail, eventId } = req.params;
    try {
        const result = await Like.deleteOne({ userEmail, eventId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Like not found" });
        }
        res.json({ message: "Unliked!" });
    } catch (err) {
        res.status(500).json({ message: "Error", error: err.message });
    }
});
// Route to delete all likes by user
// DELETE /like/:userEmail
app.delete("/like/:userEmail", async (req, res) => {
  const { userEmail } = req.params;
  try {
    const result = await Like.deleteMany({ userEmail });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Like not found" });
    }
    res.json({ message: "Unliked!" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

export default app;
