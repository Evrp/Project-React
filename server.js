// ✅ เพิ่ม Socket.IO และ dotenv
import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { Product } from "./src/model/product.js";
import { User } from "./src/model/user.js";
import { Gmail } from "./src/model/gmail.js";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
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

let onlineUsers = new Map();

// ✅ Socket.IO Setup
io.on("connection", (socket) => {
  console.log("🟢 New client connected", socket.id);

  socket.on("user-online", (user) => {
    onlineUsers.set(socket.id, user);
    io.emit("update-users", Array.from(onlineUsers.values()));
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected", socket.id);
    onlineUsers.delete(socket.id);
    io.emit("update-users", Array.from(onlineUsers.values()));
  });
});

// 📌 1️⃣ API ดึงข้อมูลจาก Amazon + บันทึกลง Database
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
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูล Amazon:", error);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลจาก Amazon ได้" });
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

server.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});

// 📌 5️⃣ API สำหรับลบผู้ใช้เมื่อ Logout
app.post("/api/logout", async (req, res) => {
  try {
    const { email } = req.body;
    await Gmail.deleteOne({ email });
    res.status(200).json({ message: "ลบผู้ใช้ออกจาก MongoDB เรียบร้อยแล้ว" });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "ไม่สามารถลบข้อมูลผู้ใช้ได้" });
  }
});