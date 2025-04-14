<<<<<<< HEAD
// ✅ Import libraries และตั้งค่าเบื้องต้น
=======

// ✅ เพิ่ม Socket.IO และ dotenv
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";
import bodyParser from "body-parser";
import mongoose from "mongoose";
<<<<<<< HEAD
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { Event } from "./src/model/event.js";
import { Product } from "./src/model/product.js";
import { User } from "./src/model/user.js";
import { Gmail } from "./src/model/gmail.js";
import { Filter } from "./src/model/filter.js";

=======
import { Product } from "./src/model/product.js";
import { User } from "./src/model/user.js";
import { Gmail } from "./src/model/gmail.js";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const port = process.env.PORT || 8080;
<<<<<<< HEAD
const AMAZON_URL = "https://www.amazon.com/MSI-Codex-Gaming-Desktop-A8NUE-274US/dp/B0DGHPPL1M/";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/6f59e6trmyro1tcn6ridueeluiutsz3j";
const MONGO_URI = process.env.MONGO_URI;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Connect MongoDB
mongoose.connect(MONGO_URI);
const db = mongoose.connection;
db.once("open", () => console.log("🔥 MongoDB Connected"));
db.on("error", (err) => console.error("❌ MongoDB Error:", err));

// ✅ เก็บสถานะออนไลน์ของผู้ใช้
let onlineUsers = new Map();

// ✅ ตั้งค่า Socket.IO
io.on("connection", (socket) => {
  console.log("🟢 New client connected", socket.id);

  socket.on("user-online", (user) => {
    if (user.email) {
      onlineUsers.set(user.email, socket.id);
      io.emit("update-users", Array.from(onlineUsers.keys()));
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected", socket.id);
    for (let [email, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(email);
        break;
      }
    }
    io.emit("update-users", Array.from(onlineUsers.keys()));
  });
});

// 📌 1️⃣ API ดึงข้อมูลจาก Amazon + บันทึกลง MongoDB
=======

app.use(cors());
app.use(bodyParser.json());

const AMAZON_URL =
  "https://www.amazon.com/MSI-Codex-Gaming-Desktop-A8NUE-274US/dp/B0DGHPPL1M/";
const MAKE_WEBHOOK_URL =
  "https://hook.eu2.make.com/6f59e6trmyro1tcn6ridueeluiutsz3j";
const uri = process.env.MONGO_URI;

mongoose.connect(uri);
const db = mongoose.connection;
db.once("open", () => {
  console.log("🔥 MongoDB Connected");
});
db.on("error", (err) => {
  console.error("❌ MongoDB Error:", err);
});

let onlineUsers = new Map(); // เก็บสถานะออนไลน์ของผู้ใช้ตามอีเมล

// เมื่อผู้ใช้เชื่อมต่อ
io.on("connection", (socket) => {
  console.log("🟢 New client connected", socket.id);

  // เมื่อมีการแจ้งว่า user ออนไลน์
  socket.on("user-online", (user) => {
    onlineUsers.set(user.email, true); // เก็บสถานะออนไลน์
    io.emit("update-users", Array.from(onlineUsers.keys())); // แจ้งให้ทุกคนรู้ว่ามีผู้ใช้ใหม่ออนไลน์
  });

  // เมื่อผู้ใช้ดิสคอนเน็ค
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected", socket.id);
    // ลบสถานะออนไลน์ของผู้ใช้ที่ดิสคอนเน็ค
    onlineUsers.forEach((_, email) => {
      if (onlineUsers.get(email) === socket.id) {
        onlineUsers.delete(email);
      }
    });
    io.emit("update-users", Array.from(onlineUsers.keys())); // แจ้งให้ทุกคนรู้ว่าผู้ใช้ได้ออกจากระบบ
  });
});


// 📌 1️⃣ API ดึงข้อมูลจาก Amazon + บันทึกลง Database
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
app.get("/api/scrape-amazon", async (req, res) => {
  try {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    };

    const { data } = await axios.get(AMAZON_URL, { headers });
    const $ = cheerio.load(data);

    const product = new Product({
      name: $("#productTitle").text().trim(),
      image: $("#landingImage").attr("src"),
      price:
        $(".a-price-whole").first().text().replace(/\D/g, "") +
        "." +
        $(".a-price-fraction").first().text(),
      link: AMAZON_URL,
    });

    await product.save();
    res.json(product);
  } catch (error) {
<<<<<<< HEAD
    console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูล Amazon:", error);
=======
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูล Amazon:", error);
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลจาก Amazon ได้" });
  }
});

<<<<<<< HEAD
// 📌 2️⃣ API บันทึก User + Amazon → MongoDB และส่งไป Make.com
=======
// 📌 2️⃣ API รับข้อมูล User + Amazon → บันทึกลง Database + ส่งไป Make.com
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
app.post("/api/send-to-make-combined", async (req, res) => {
  try {
    const { userData, amazonData } = req.body;
    const user = new User(userData);
    await user.save();
<<<<<<< HEAD

    await axios.post(MAKE_WEBHOOK_URL, {
      user_info: userData,
      amazon_product: amazonData,
    });

    res.json({ message: "ส่งข้อมูลไปยัง Make.com สำเร็จ" });
  } catch (error) {
    console.error("❌ Error sending combined data to Make.com:", error);
=======
    const payload = {
      user_info: userData,
      amazon_product: amazonData,
    };

    await axios.post(MAKE_WEBHOOK_URL, payload);

    res.json({ message: "ส่งข้อมูลไปยัง Make.com สำเร็จ" });
  } catch (error) {
    console.error("Error sending combined data to Make.com:", error);
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
    res.status(500).json({ error: "ไม่สามารถส่งข้อมูลไปยัง Make.com ได้" });
  }
});

<<<<<<< HEAD
// 📌 3️⃣ API Login ด้วย Google + บันทึก Gmail ลง MongoDB
app.post("/api/login", async (req, res) => {
  try {
    const { displayName, email, photoURL } = req.body;

    let user = await Gmail.findOne({ email });
    if (!user) {
      user = new Gmail({ displayName, email, photoURL });
=======
// 📌 3️⃣ API บันทึก/อัปเดตผู้ใช้จาก Google Login
app.post("/api/login", async (req, res) => {
  try {
    const { displayName, email, photoURL } = req.body;
    let user = await Gmail.findOne({ email });

    if (!user) {
      user = new Gmail({ displayName, email, photoURL }); // สร้างข้อมูลผู้ใช้ใหม่ใน Gmail model
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
    } else {
      user.displayName = displayName;
      user.photoURL = photoURL;
    }

    await user.save();
    res.status(200).json({ message: "Login บันทึกลง MongoDB เรียบร้อยแล้ว" });
  } catch (error) {
<<<<<<< HEAD
    console.error("❌ Error saving login:", error);
=======
    console.error("Error saving login to MongoDB:", error);
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
    res.status(500).json({ message: "ไม่สามารถบันทึกข้อมูลผู้ใช้ได้" });
  }
});

<<<<<<< HEAD
// 📌 4️⃣ API ดึงผู้ใช้ทั้งหมด (Friend List)
=======

// 📌 4️⃣ API ดึงผู้ใช้ทั้งหมด (สำหรับแสดง Friend List)
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
app.get("/api/users", async (req, res) => {
  try {
    const users = await Gmail.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "ไม่สามารถโหลดผู้ใช้ได้" });
  }
});

<<<<<<< HEAD
// 📌 5️⃣ API Logout → ลบจาก MongoDB + แจ้ง Socket.IO
=======
server.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});

// 📌 5️⃣ API สำหรับลบผู้ใช้เมื่อ Logout
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
app.post("/api/logout", async (req, res) => {
  try {
    const { email } = req.body;
    await Gmail.deleteOne({ email });
<<<<<<< HEAD

    onlineUsers.delete(email); // ลบจาก Map
    io.emit("user-logout", email); // แจ้งทุกคน
    io.emit("update-users", Array.from(onlineUsers.keys())); // อัปเดตรายการออนไลน์

=======
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
    res.status(200).json({ message: "ลบผู้ใช้ออกจาก MongoDB เรียบร้อยแล้ว" });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "ไม่สามารถลบข้อมูลผู้ใช้ได้" });
  }
});
<<<<<<< HEAD

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
///////////// API บันทึก Event จาก Make.com
app.post("/api/save-event", async (req, res) => {
  try {
    const {
      title,
      genre,
      location,
      date,
      description,
      imageUrl,
      link,
    } = req.body;

    if (!title || !genre || !location || !date) {
      return res.status(400).json({ message: "Missing required fields" });
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
    });

    await newEvent.save();
    res.status(201).json({ message: "Event saved successfully", event: newEvent });
  } catch (error) {
    console.error("❌ Error saving event:", error);
    res.status(500).json({ message: "Server error" });
  }
});
/////////////API ดึง Event ไปแสดงใน React
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }); // เรียงตามวันที่
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
=======
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
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
