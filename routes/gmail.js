import express from "express";
import { Gmail } from "../src/model/gmail.js";
const app = express.Router();

// 📌 3️⃣ API บันทึก/อัปเดตผู้ใช้จาก Google Login
app.post("/login", async (req, res) => {
  try {
    const { displayName, email, photoURL } = req.body;
    let user = await Gmail.findOne({ email });

    if (!user) {
      user = new Gmail({ displayName, email, photoURL });
    } else {
      user.displayName = displayName;
      user.photoURL = photoURL;
    }

    await user.save();
    res.status(200).json({ message: "Login บันทึกลง MongoDB เรียบร้อยแล้ว" });
  } catch (error) {
    console.error("Error saving login to MongoDB:", error);
    res.status(500).json({ message: "ไม่สามารถบันทึกข้อมูลผู้ใช้ได้" });
  }
});

// 📌 4️⃣ API ดึงผู้ใช้ทั้งหมด (สำหรับแสดง Friend List)
app.get("/users", async (req, res) => {
  try {
    const users = await Gmail.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "ไม่สามารถโหลดผู้ใช้ได้" });
  }
});


// สำหรับดึงข้อมูลเพื่อน (usersfriends)
app.get("/usersfriends", async (req, res) => {
  try {
    const email = JSON.parse(decodeURIComponent(req.query.emails));
    const users = await Gmail.find({ email: { $in: email } });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// API สำหรับลบผู้ใช้เมื่อ Logout (real-time)
app.post("/logout", async (req, res) => {
  try {
    const { email } = req.body;
    io.emit("user-logout", email); // ต้องส่ง io จาก server.js ถ้าต้องการใช้
    res.status(200).json({ message: "ลบผู้ใช้ออกจาก MongoDB เรียบร้อยแล้ว" });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "ไม่สามารถลบข้อมูลผู้ใช้ได้" });
  }
});

// POST /api/save-user-info
app.post("/save-user-info", async (req, res) => {
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

// Change Nickname
app.post("/save-user-name", async (req, res) => {
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

// Get user by email (query)
app.get("/get-user", async (req, res) => {
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

// GET /api/user-info/:email
app.get("/user-info/:email", async (req, res) => {
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

export default app;
