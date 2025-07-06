import express from "express";
import { Info } from "../src/model/info.js";
const router = express.Router();

// routes/api.js หรือไฟล์หลักของ backend
router.post("/join-community", async (req, res) => {
  const { userEmail, roomId, roomName } = req.body;
  console.log(userEmail, roomId, roomName);
  if (!userEmail || !roomId || !roomName) {
    return res
      .status(400)
      .json({ error: "userEmail and roomId are required." });
  }
  try {
    const updatedUser = await Info.findOneAndUpdate(
      { email: userEmail },
      {
        $push: {
          joinedRooms: { roomId, roomName },
        },
      },
      { new: true, runValidators: true }
    );

    res.json(updatedUser);
  } catch (err) {
    console.error("Error while joining room:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//////////ดึงห้องที่ผู้ใช้เชื่อมต่อ/////////////////
router.get("/user-rooms/:email", async (req, res) => {
  const encodedEmail = req.params.email.toLowerCase();
  console.log("Getting rooms for:", encodedEmail);

  try {
    const user = await Info.findOne({ email: encodedEmail });
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ แยกเฉพาะ roomId ออกมา

    const roomIds = user.joinedRooms.map((room) => room.roomId);
    console.log(roomIds);
    // ✅ หาห้องจาก roomIds
    const roomNames = user.joinedRooms.map((room) => room.roomName);
    console.log(roomNames);
    res.status(200).json({ roomNames, roomIds });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ดึงข้อมูลผู้ใช้ทั้งหมด (nicknames)
// ใช้สำหรับแสดงรายชื่อผู้ใช้ในหน้าเพื่อน
router.get("/get-all-nicknames", async (req, res) => {
  try {
    const users = await Info.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "ไม่สามารถโหลดผู้ใช้ได้" });
  }
});
// Get user by email (query)
router.get("/get-user", async (req, res) => {
  const { email } = req.query;
  try {
    const user = await Info.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }
    res.json(user);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});
// POST /api/save-user-info
router.post("/save-user-info", async (req, res) => {
  const { email, userInfo } = req.body;
  try {
    const updatedUser = await Info.findOneAndUpdate(
      { email },
      { userInfo },
      { new: true, upsert: true }
    );
    res.json({ message: "User info saved", data: updatedUser });
  } catch (error) {
    console.error("❌ Error saving user info:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// GET /api/user-info/:email
router.get("/user-info/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const user = await Info.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.userInfo || {});
  } catch (error) {
    console.error("❌ Error fetching user info:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// Change Nickname
router.post("/save-user-name", async (req, res) => {
  const { userEmail, nickName } = req.body;
  try {
    const infoUpdate = await Info.findOneAndUpdate(
      { email: userEmail },
      {
        $set: {
          nickname: nickName,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );
    if (!infoUpdate) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้นี้ในทั้งสอง collection" });
    }
    res.json({
      message: "อัปเดต nickname และ displayName เรียบร้อย",
      info: infoUpdate,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
});

// Export the router
export default router;
