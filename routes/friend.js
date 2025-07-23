import express from "express";
import Friend from "../src/model/Friend.js";
const router = express.Router();

// เพิ่มเพื่อน
router.post("/add-friend", async (req, res) => {
    const { userEmail, friendEmail, roomId } = req.body;
    if (!userEmail || !friendEmail || !roomId) {
        return res.status(400).json({ error: "Both userEmail and friendEmail are required." });
    }
    if (userEmail === friendEmail) {
        return res.status(400).json({ error: "You cannot add yourself as a friend." });
    }
    try {
        const user = await Friend.addFriend(userEmail, friendEmail, roomId);
        return res.status(200).json({ message: "Friend added successfully.", user });
    } catch (error) {
        console.error("Error while adding friend:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// ดึงข้อมูลเพื่อน
router.get("/friends/:email", async (req, res) => {
    const { email } = req.params;
    try {
        const user = await Friend.findOne({ email });
        if (!user) return res.status(404).send("User not found");
        res.json(user.friends);
    } catch (error) {
        console.error("Error fetching friends:", error);
        res.status(500).send("Server error");
    }
});

// ดึงข้อมูลเพื่อนทั้งหมด
router.get("/friends", async (req, res) => {
    try {
        const friends = await Friend.find();
        res.json(friends);
    } catch (error) {
        console.error("Error fetching friends:", error);
        res.status(500).json({ message: "Failed to fetch friends" });
    }
});

// ลบเพื่อนออกจาก list ของ user
router.delete("/users/:userEmail/friends/:friendEmail", async (req, res) => {
    const { userEmail, friendEmail } = req.params;
    try {
        const user = await Friend.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ message: "User not found" });
        // Remove friend object from friends array by email
        user.friends = user.friends.filter(f => f.email !== friendEmail);
        await user.save();
        res.json({ message: "Friend removed successfully", friends: user.friends });
    } catch (err) {
        console.error("Error removing friend:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Follow Friend
router.post("/users/:userEmail/follow/:targetEmail", async (req, res) => {
    const { userEmail, targetEmail } = req.params;
    if (userEmail === targetEmail)
        return res.status(400).json({ message: "Cannot follow yourself" });
    try {
        const user = await Friend.findOne({ email: userEmail });
        const target = await Friend.findOne({ email: targetEmail });
        if (!user || !target)
            return res.status(404).json({ message: "User not found" });
        if (!user.following.includes(targetEmail)) {
            user.following.push(targetEmail);
            await user.save();
        }
        if (!target.followers.includes(userEmail)) {
            target.followers.push(userEmail);
            await target.save();
        }
        res.json({ message: "Followed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Unfollow Friend
router.delete("/users/:userEmail/unfollow/:targetEmail", async (req, res) => {
    const { userEmail, targetEmail } = req.params;
    try {
        const user = await Friend.findOne({ email: userEmail });
        const target = await Friend.findOne({ email: targetEmail });
        if (!user || !target)
            return res.status(404).json({ message: "User not found" });
        user.following = user.following.filter((email) => email !== targetEmail);
        await user.save();
        target.followers = target.followers.filter((email) => email !== userEmail);
        await target.save();
        res.json({ message: "Unfollowed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Get follow info
router.get("/user/:email/follow-info", async (req, res) => {
    const userEmail = req.params.email;
    try {
        const user = await Friend.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ message: "User not found" });
        const followers = await Friend.find({ email: { $in: user.followers } });
        const following = await Friend.find({ email: { $in: user.following } });
        res.json({ followers, following });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});
router.get("/users/:email", async (req, res) => {
  const userEmail = req.params.email.toLowerCase();
  try {
    const user = await Friend.findOne({ email: userEmail });
    res.json(user);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
