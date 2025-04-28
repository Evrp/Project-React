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
import Friend from "./src/model/Friend.js";


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  methods: ["GET", "POST"]
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
    onlineUsers.set(user.email, true); // เก็บสถานะออนไลน์
    io.emit("update-users", Array.from(onlineUsers.keys())); // แจ้งให้ทุกคนรู้ว่ามีผู้ใช้ใหม่ออนไลน์
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected", socket.id);
    onlineUsers.delete(socket.email); 
    io.emit("update-users", Array.from(onlineUsers.keys())); // แจ้งให้ทุกคนรู้ว่าผู้ใช้ได้ออกจากระบบ
  });
});

// API สำหรับเพิ่มเพื่อน
app.post('/api/add-friend', async (req, res) => {
  const { userEmail, friendEmail } = req.body;
  console.log(userEmail, friendEmail);

  if (!userEmail || !friendEmail) {
    return res.status(400).json({ error: "Both userEmail and friendEmail are required." });
  }

  try {
    const updateResult = await Gmail.updateOne(
      { email: userEmail },
      { $addToSet: { friends: friendEmail } } // เพิ่มเพื่อนเข้า array ถ้าไม่ซ้ำ
    );

    if (updateResult.modifiedCount > 0) {
      // อัปเดตสำเร็จ
      return res.status(200).json({ message: "Friend added successfully." });
    } else {
      // หา user ไม่เจอ หรือไม่มีการเปลี่ยนแปลง
      return res.status(404).json({ error: "User not found or friend already added." });
    }
  } catch (error) {
    console.error("Error while adding friend:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});




// ดึงรายชื่อเพื่อนทั้งหมดของ user คนหนึ่ง
app.get('/api/friends/:email', async (req, res) => {
  const { email } = req.params;

  try {
    // ค้นหาเพื่อนจาก email ของผู้ใช้
    const user = await Friend.findOne({ email });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // ส่งข้อมูลของเพื่อนกลับไป
    res.json(user.friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).send('Server error');
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
app.get('/api/usersfriends', async (req, res) => {
  try {
    // รับข้อมูล emails ที่ส่งมาจาก query string และ parse มันให้เป็น array
    const email = JSON.parse(decodeURIComponent(req.query.emails));
    console.log('Decoded emails:', email); // ดีบักค่า emails ที่รับมา

    // ค้นหาผู้ใช้งานที่มี email ตรงกับรายการใน array `emails`
    const users = await Gmail.find({ emails: { $in: email } });

    // ส่งข้อมูลผู้ใช้งานที่ค้นพบกลับไป
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
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
  const { email, genres } = req.body;
  if (!email || !genres) {
    return res.status(400).json({ message: "Missing email or genres" });
  }

  try {
    const user = await Filter.findOneAndUpdate(
      { email },
      { genres },
      { new: true, upsert: true } // เพิ่ม upsert เผื่อ user ยังไม่มีใน Filter
    );

    // ✅ ส่งข้อมูลไปยัง Make.com
    await axios.post(MAKE_WEBHOOK_URL, {
      type: "update-genres",
      filter_info: {
        email: user.email,
        genres: user.genres,
      },
    });

    res.status(200).json({ message: "Genres updated & sent to Make.com", user });
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

// ✅ Start Server
server.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});
///////////ลบ event

// 📌 ลบ Event รายการเดียว
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

app.delete("/api/remove-friend", async (req, res) => {
  const { userEmail, friendEmail } = req.body;

  if (!userEmail || !friendEmail) {
    return res.status(400).json({ error: "Both userEmail and friendEmail are required." });
  }

  try {
    // ตัวอย่างการลบเพื่อนจากฐานข้อมูล
    const result = await Friend.removeFriend(userEmail, friendEmail);  // ฟังก์ชัน removeFriend ต้องไปตรวจสอบในโมเดลของคุณ

    if (result) {
      res.status(200).json({ message: "Friend removed successfully." });
    } else {
      res.status(404).json({ error: "Friend not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});

