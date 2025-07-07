// ✅ Import libraries และตั้งค่าเบื้องต้น
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import userRoutes from "./routes/gmail.js";
import friendRoutes from "./routes/friend.js";
import roomRoutes from "./routes/room.js";
import infoRoutes  from "./routes/info.js";
import eventRoutes from "./routes/event.js";
import roommatchRoutes  from "./routes/eventmatch.js"; // Routes from "./routes/room.js";
import mongoose from "mongoose";
import { Filter } from "./src/model/filter.js";
import axios from "axios";


dotenv.config();
const allowedOrigins = [
  "https://project-react-mocha-eta.vercel.app", // production frontend
  "http://localhost:5173", // local dev frontend
];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const port = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;
// ✅ Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(bodyParser.json());

// ✅ Connect MongoDB
mongoose.connect(MONGO_URI);
const db = mongoose.connection;
db.once("open", () => console.log("🔥 MongoDB Connected"));
db.on("error", (err) => console.error("❌ MongoDB Error:", err));

const onlineUsers = new Map(); // email => Set of socket IDs

io.on("connection", (socket) => {
  console.log("🟢 New client connected", socket.id);

  socket.on("user-online", (user) => {
    console.log("🧑‍💻 Online user", user); // <<< เพิ่ม log นี้
    console.log("🟢 User online", user.email);
    const { email } = user;
    socket.email = email;

    // เพิ่ม socket.id เข้าไปใน Set
    if (!onlineUsers.has(email)) {
      onlineUsers.set(email, new Set());
    }
    onlineUsers.get(email).add(socket.id);

    // อัปเดตให้ทุก client
    console.log("🧑‍💻 Online user", user);
    io.emit("update-users", Array.from(onlineUsers.keys()));
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected", socket.id);
    console.log("🔴 Client disconnected", socket.id);
    const email = socket.email;
    if (email && onlineUsers.has(email)) {
      onlineUsers.get(email).delete(socket.id);
      if (onlineUsers.get(email).size === 0) {
        onlineUsers.delete(email); // ไม่มี socket เหลือแล้ว
      }
    }

    // ส่ง user list ไปให้ทุก client
    io.emit("update-users", Array.from(onlineUsers.keys()));
    console.log("🔴 Client disconnected", socket.id);
  });
});
// 📌 API บันทึกหมวดหมู่เพลงที่ผู้ใช้เลือก
app.post("/api/update-genres", async (req, res) => {
  const { email, genres, subGenres, updatedAt } = req.body;
  if (!email || !genres || !subGenres) {
    return res
      .status(400)
      .json({ message: "Missing email, genres, or subGenres" });
  }

  try {
    const user = await Filter.findOneAndUpdate(
      { email },
      { genres, subGenres: subGenres || {} },
      { new: true, upsert: true } // เพิ่ม upsert เผื่อ user ยังไม่มีใน Filter
    );

    // ✅ ส่งข้อมูลไปยัง Make.com เฉพาะกรณีที่ genres/subGenres มีข้อมูล
    const hasGenres = Array.isArray(genres) ? genres.length > 0 : false;
    const hasSubGenres = subGenres && typeof subGenres === "object" && Object.values(subGenres).some(arr => Array.isArray(arr) ? arr.length > 0 : false);
    if (hasGenres && hasSubGenres) {
      await axios.post(MAKE_WEBHOOK_URL, {
        type: "update-genres",
        filter_info: {
          email: user.email,
          genres: user.genres,
          subGenres: user.subGenres,
          updatedAt: updatedAt || new Date().toISOString(),
        },
      });
    }

    res
      .status(200)
      .json({ message: "Genres updated & sent to Make.com", user });
  } catch (error) {
    console.error("❌ Update failed:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ใช้งาน routes ที่แยกไว้
app.use("/api", userRoutes);
app.use("/api", friendRoutes);
app.use("/api", roomRoutes);
app.use("/api", eventRoutes);
app.use("/api", infoRoutes);
app.use("/api", roommatchRoutes);

// เริ่มต้นเซิร์ฟเวอร์
server.listen(port, () =>
  console.log(`🚀 Server is running on port ${(8080, "0.0.0.0")}`)
);
