import exepress from "express";
import { Info } from "../src/model/info.js";
const router = exepress.Router();

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
router.get("/get-all-nicknames", async (req, res) => {
  try {
    const users = await Info.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "ไม่สามารถโหลดผู้ใช้ได้" });
  }
});
// Export the router
export default router;