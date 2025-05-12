// ✅ Import libraries และตั้งค่าเบื้องต้น
import express from "express";
import cors from "cors";
import axios from "axios";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { User } from "./src/model/user.js";
import { Gmail } from "./src/model/gmail.js";
import { Filter } from "./src/model/filter.js";
import { Event } from "./src/model/event.js";
import { Info } from "./src/model/info.js";
import { Room } from "./src/model/room.js"; // import Room from "./src/model/room.js";
// import Friend from "./src/model/Friend.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

const port = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Connect MongoDB
mongoose.connect(MONGO_URI);
const db = mongoose.connection;
db.once("open", () => console.log("🔥 MongoDB Connected"));
db.on("error", (err) => console.error("❌ MongoDB Error:", err));

let onlineUsers = new Map(); // เก็บสถานะออนไลน์ของผู้ใช้ตามอีเมล

// เมื่อผู้ใช้เชื่อมต่อ
io.on("connection", (socket) => {
  console.log("🟢 New client connected", socket.id);

  socket.on("user-online", (user) => {
    socket.email = user.email; // <<< เก็บ email ลง socket
    onlineUsers.set(user.email, true); // เก็บสถานะออนไลน์
    io.emit("update-users", Array.from(onlineUsers.keys())); // แจ้งให้ทุกคนรู้ว่ามีผู้ใช้ใหม่ออนไลน์
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected", socket.id);
    onlineUsers.delete(socket.email);
    io.emit("update-users", Array.from(onlineUsers.keys())); // แจ้งให้ทุกคนรู้ว่าผู้ใช้ได้ออกจากระบบ
  });
});

// 📌 7️⃣ API เพิ่มเพื่อน
app.post("/api/add-friend", async (req, res) => {
  const { userEmail, friendEmail } = req.body;
  console.log(userEmail, friendEmail);

  if (!userEmail || !friendEmail) {
    return res
      .status(400)
      .json({ error: "Both userEmail and friendEmail are required." });
  }

  // ป้องกันไม่ให้เพิ่มตัวเองเป็นเพื่อน
  if (userEmail === friendEmail) {
    return res
      .status(400)
      .json({ error: "You cannot add yourself as a friend." });
  }

  try {
    const user = await Friend.addFriend(userEmail, friendEmail); // ใช้ static method ใน model
    return res
      .status(200)
      .json({ message: "Friend added successfully.", user });
  } catch (error) {
    console.error("Error while adding friend:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 📌 7️⃣ API ดึงข้อมูลเพื่อน
app.get("/api/friends/:email", async (req, res) => {
  const { email } = req.params;

  try {
    // ค้นหาเพื่อนจาก email ของผู้ใช้
    const user = await Friend.findOne({ email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // ส่งข้อมูลของเพื่อนกลับไป
    res.json(user.friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).send("Server error");
  }
});

// API สำหรับดึงข้อมูลเพื่อน
app.get("/api/friends", async (req, res) => {
  try {
    const friends = await Friend.find();
    res.json(friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Failed to fetch friends" });
  }
});

// 📌 2️⃣ API รับข้อมูล User + Amazon → บันทึกลง Database + ส่งไป Make.com
app.post("/api/send-to-make-combined", async (req, res) => {
  try {
    const { userData, amazonData } = req.body;
    const user = new User(userData);
    await user.save();

    const payload = {
      user_info: userData,
      amazon_product: amazonData,
    };

    await axios.post(MAKE_WEBHOOK_URL, payload);

    res.json({ message: "ส่งข้อมูลไปยัง Make.com สำเร็จ" });
  } catch (error) {
    console.error("Error sending combined data to Make.com:", error);
    res.status(500).json({ error: "ไม่สามารถส่งข้อมูลไปยัง Make.com ได้" });
  }
});

// 📌 3️⃣ API บันทึก/อัปเดตผู้ใช้จาก Google Login
app.post("/api/login", async (req, res) => {
  try {
    const { displayName, email, photoURL } = req.body;
    let user = await Gmail.findOne({ email });

    if (!user) {
      user = new Gmail({ displayName, email, photoURL }); // สร้างข้อมูลผู้ใช้ใหม่ใน Gmail model
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
app.get("/api/users", async (req, res) => {
  try {
    const users = await Gmail.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "ไม่สามารถโหลดผู้ใช้ได้" });
  }
});

// Express route สำหรับดึงข้อมูลเพื่อน
app.get("/api/usersfriends", async (req, res) => {
  try {
    // รับข้อมูล emails ที่ส่งมาจาก query string และ parse มันให้เป็น array
    const email = JSON.parse(decodeURIComponent(req.query.emails));
    console.log("Decoded emails:", email); // ดีบักค่า emails ที่รับมา

    // ค้นหาผู้ใช้งานที่มี email ตรงกับรายการใน array `emails`
    const users = await Gmail.find({ email: { $in: email } });

    // ส่งข้อมูลผู้ใช้งานที่ค้นพบกลับไป
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// 📌 5️⃣ API สำหรับลบผู้ใช้เมื่อ Logout (ทำงานแบบ real-time)
app.post("/api/logout", async (req, res) => {
  try {
    const { email } = req.body;
    await Gmail.deleteOne({ email });
    io.emit("user-logout", email); // แจ้งทุกคนว่าผู้ใช้ได้ออกจากระบบแล้ว
    res.status(200).json({ message: "ลบผู้ใช้ออกจาก MongoDB เรียบร้อยแล้ว" });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "ไม่สามารถลบข้อมูลผู้ใช้ได้" });
  }
});

// 📌 6️⃣ API บันทึกหมวดหมู่เพลงที่ผู้ใช้เลือก
app.post("/api/update-genres", async (req, res) => {
  const { email, genres, subGenres, updatedAt } = req.body;
  if (!email || !genres || !subGenres) {
    return res.status(400).json({ message: "Missing email, genres, or subGenres" });
  }

  try {
    const user = await Filter.findOneAndUpdate(
      { email },
      { genres, subGenres: subGenres || {} },
      { new: true, upsert: true } // เพิ่ม upsert เผื่อ user ยังไม่มีใน Filter
    );

    // ✅ ส่งข้อมูลไปยัง Make.com
    await axios.post(MAKE_WEBHOOK_URL, {
      type: "update-genres",
      filter_info: {
        email: user.email,
        genres: user.genres,
        subGenres: user.subGenres,
        updatedAt: updatedAt || new Date().toISOString(),
      },
    });

    res
      .status(200)
      .json({ message: "Genres updated & sent to Make.com", user });
  } catch (error) {
    console.error("❌ Update failed:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 7️⃣ API บันทึก Event จาก Make.com
app.post("/api/save-event", async (req, res) => {
  const {
    title,
    genre,
    location,
    date,
    description,
    imageUrl,
    link,
    isFirst,
    email,
  } = req.body;

  try {
    if (isFirst) {
      const deleted = await Event.deleteMany({});
      console.log("🧹 Deleted all events:", deleted.deletedCount);
    }

    const newEvent = new Event({
      title,
      genre,
      location,
      date,
      description,
      imageUrl,
      link,
      createdByAI: true,
      email,
    });

    await newEvent.save();
    res.status(201).json({ message: "Event saved", event: newEvent });
  } catch (error) {
    console.error("❌ Error saving event:", error);
    res.status(500).json({ message: "Failed to save event" });
  }
});

// ดึง filter ตาม email
app.get("/api/filters/:email", async (req, res) => {
  try {
    const filter = await Filter.findOne({ email: req.params.email }); // ดึงตาม email
    if (!filter) return res.status(404).json({ message: "ไม่พบข้อมูล" });
    res.json(filter);
  } catch (error) {
    console.error("Error fetching filter:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 8️⃣ API ดึง Event ไปแสดงใน React
app.get("/api/events", async (req, res) => {
  const email = req.query.email;

  try {
    const events = await Event.find({ email }).sort({ date: 1 }); // เรียงตามวันที่
    res.json(events);
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 9️⃣ API ลบ Event
app.delete("/api/detele-events/:id", async (req, res) => {
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

// POST /api/save-user-info
app.post("/api/save-user-info", async (req, res) => {
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

// GET /api/user-info?email=xxx
app.get("/api/user-info", async (req, res) => {
  const { email } = req.query;

  try {
    const user = await Info.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.userInfo || {});
  } catch (error) {
    console.error("❌ Error fetching user info:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/update-display-name", async (req, res) => {
  const { email, displayName } = req.body;

  if (!email || !displayName) {
    return res.status(400).json({ message: "Missing email or displayName" });
  }

  try {
    const user = await Gmail.findOneAndUpdate(
      { email },
      { displayName },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Display name updated", user });
  } catch (error) {
    console.error("Error updating display name:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/createroom", async (req, res) => {
  try {
    const { name, image, description, createdBy } = req.body;
    const room = new Room({ name, image, description, createdBy });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

app.get("/api/allroom", async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

app.get("/matches/:email", async (req, res) => {
  try {
    const user = await Filter.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const userGenres = user.genres;

    // ค้นหาผู้ใช้คนอื่นที่มี genres เหมือนกัน
    const matches = await Filter.find({
      email: { $ne: req.params.email }, // ไม่รวมตัวเอง
      genres: { $in: userGenres }, // มี genre อย่างน้อย 1 อย่างเหมือนกัน
    });

    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// เริ่มต้นเซิร์ฟเวอร์
server.listen(port, () => console.log(`🚀 Server is running on port ${port}`));
