// ✅ Import libraries และตั้งค่าเบื้องต้น
import express from "express";
import cors from "cors";
import axios from "axios";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { Gmail } from "./src/model/gmail.js";
import { Filter } from "./src/model/filter.js";
import { Event } from "./src/model/event.js";
import { Info } from "./src/model/info.js";
import { Room } from "./src/model/room.js";
import { ImageGenre } from "./src/model/image.js"; // import Room from "./src/model/room.js";
import Friend from "./src/model/Friend.js";

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

const onlineUsers = new Map(); // email => Set of socket IDs

io.on("connection", (socket) => {
  console.log("🟢 New client connected", socket.id);

  socket.on("user-online", (user) => {
    const { email } = user;
    socket.email = email;

    // เพิ่ม socket.id เข้าไปใน Set
    if (!onlineUsers.has(email)) {
      onlineUsers.set(email, new Set());
    }
    onlineUsers.get(email).add(socket.id);

    // อัปเดตให้ทุก client
    io.emit("update-users", Array.from(onlineUsers.keys()));
  });

  socket.on("disconnect", () => {
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

// routes/api.js หรือไฟล์หลักของ backend
app.post("/api/join-community", async (req, res) => {
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
app.get("/api/user-rooms/:email", async (req, res) => {
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

// GET /api/users/:email
app.get("/api/users/:email", async (req, res) => {
  const userEmail = req.params.email.toLowerCase();
  try {
    const user = await Friend.findOne({ email: userEmail });
    res.json(user);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// app.get("/api/users/gmail/:email", async (req, res) => {
//   const { email } = req.params;
//   try {
//     const user = await Friend.findOne({ email }); // เปลี่ยนเป็น model จริง
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

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
////////////Get all nickNames ////////////
app.get("/api/get-all-nicknames", async (req, res) => {
  try {
    const users = await Info.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "ไม่สามารถโหลดผู้ใช้ได้" });
  }
});

///////////สำหรับดึงข้อมูลเพื่อน
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
    // await Gmail.deleteOne({ email });
    io.emit("user-logout", email); // แจ้งทุกคนว่าผู้ใช้ได้ออกจากระบบแล้ว
    res.status(200).json({ message: "ลบผู้ใช้ออกจาก MongoDB เรียบร้อยแล้ว" });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "ไม่สามารถลบข้อมูลผู้ใช้ได้" });
  }
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
// 📌 API บันทึก Event จาก Make.com///////
app.post("/api/save-event", async (req, res) => {
  const { title, genre, location, date, description, link, isFirst, email } =
    req.body;

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
///📌 API ดึง filter ตาม email
app.get("/api/filters/:email", async (req, res) => {
  try {
    const filter = await Filter.findOne({ email: req.params.email }); // ดึงตาม email
    res.json(filter || null); // ถ้าไม่เจอให้ส่ง null
  } catch (error) {
    console.error("Error fetching filter:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 API ดึง Event ไปแสดงใน React
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
// 📌 API ลบ Event
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
/////////////Delete Room///////////////
app.delete("/api/delete-rooms/:name", async (req, res) => {
  const { name } = req.params;
  console.log(name);
  try {
    // 1. ลบ room document
    const deletedRoom = await Room.findOneAndDelete({ name });

    if (!deletedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    const roomIdToDelete = deletedRoom._id.toString();

    // 2. ลบ room ออกจาก joinedRooms ของทุก user
    const result = await Info.updateMany(
      {},
      {
        $pull: {
          joinedRooms: {
            roomId: roomIdToDelete,
          },
        },
      }
    );

    res.json({
      message: "Room deleted and removed from user joinedRooms",
      deletedRoom,
      updatedUsers: result.modifiedCount,
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});
////////////Delete Joined Room///////////////
app.delete(
  "/api/delete-joined-rooms/:roomName/:userEmail",
  async (req, res) => {
    const { roomName, userEmail } = req.params;

    try {
      // 1. หาข้อมูลห้องจากชื่อ
      const room = await Room.findOne({ name: roomName });
      console.log("Found room:", room);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      const roomId = room._id.toString();
      console.log("Room ID:", roomId);
      // 2. ลบห้องออกจาก joinedRooms (ทั้งรูปแบบ String และ Object)
      const result = await Info.updateOne(
        { email: userEmail },
        {
          $pull: {
            joinedRooms: {
              $or: [
                { roomId: roomId }, // กรณีเป็น String
                { roomName: roomName }, // กรณีเป็น Object
              ],
            },
          },
        }
      );

      console.log("Update result:", result);

      if (result.modifiedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "User or room not found in joinedRooms",
        });
      }

      res.json({
        success: true,
        message: "Room removed from user's joinedRooms",
        roomName: roomName,
        userEmail: userEmail,
      });
    } catch (err) {
      console.error("Delete error:", err);
      res.status(500).json({
        success: false,
        message: "Delete failed",
        error: err.message,
      });
    }
  }
);
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
////////////Change Nickname////////////
app.post("/api/save-user-name", async (req, res) => {
  const { userEmail, nickName } = req.body;

  try {
    // ✅ อัปเดต nickname ใน Info collection
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
      return res
        .status(404)
        .json({ message: "ไม่พบผู้ใช้นี้ในทั้งสอง collection" });
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

app.get("/api/get-user", async (req, res) => {
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

// GET /api/user-info?email=xxx
app.get("/api/user-info/:email", async (req, res) => {
  const { email } = req.params;

  try {
    console.log("Fetching user info for email:", email);
    const user = await Info.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.userInfo || {});
  } catch (error) {
    console.error("❌ Error fetching user info:", error);
    res.status(500).json({ message: "Server error" });
    res.status(404).json({ message: "Server error" });
  }
});

///////////////Create Room/////////////
app.post("/api/createroom", async (req, res) => {
  try {
    const { name, image, description, createdBy, roomId } = req.body;
    const room = new Room({ name, image, description, createdBy, roomId });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

app.get("/api/allrooms", async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});
//////////////Freind Match////////////
app.get("/matches/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const user = await Filter.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // หา matches ที่ genre ตรงกัน
    const matches = await Filter.find({
      email: { $ne: email },
      genres: { $in: user.genres },
    });

    // ดึงอีเมลทั้งหมดของ matches มาใช้ค้นใน Gmail
    const matchEmails = matches.map((m) => m.email);

    const gmailUsers = await Gmail.find({ email: { $in: matchEmails } });

    // รวมข้อมูลจากทั้ง 2 collection
    const combinedMatches = matches.map((match) => {
      const gmailUser = gmailUsers.find((g) => g.email === match.email);
      return {
        ...match.toObject(),
        displayName: gmailUser?.displayName || "",
        photoURL: gmailUser?.photoURL || "",
      };
    });

    res.json(combinedMatches);
  } catch (error) {
    console.error("Match error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ลบเพื่อนออกจาก list ของ user
app.delete("/api/users/:userEmail/friends/:friendEmail", async (req, res) => {
  const { userEmail, friendEmail } = req.params;
  try {
    const user = await Friend.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.friends = user.friends.filter((email) => email !== friendEmail);
    await user.save();

    res.json({ message: "Friend removed successfully", friends: user.friends });
  } catch (err) {
    console.error("Error removing friend:", err);
    res.status(500).json({ message: "Server error" });
  }
});
//////////////Follow Freind//////////
app.post("/api/users/:userEmail/follow/:targetEmail", async (req, res) => {
  const { userEmail, targetEmail } = req.params;

  if (userEmail === targetEmail)
    return res.status(400).json({ message: "Cannot follow yourself" });

  try {
    const user = await Friend.findOne({ email: userEmail });
    const target = await Friend.findOne({ email: targetEmail });

    if (!user || !target)
      return res
        .status(404)
        .json({ message: user + target + "User not found" });
    // ติดตาม
    if (!user.following.includes(targetEmail)) {
      user.following.push(targetEmail);
      await user.save();
    }

    // เพิ่มคนติดตาม
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
//////////////UnFollow Freind//////////
app.delete("/api/users/:userEmail/unfollow/:targetEmail", async (req, res) => {
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
///////////get follow by userEmail/////////
app.get("/api/user/:email/follow-info", async (req, res) => {
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
///////////delete event////////
app.delete("/api/delete-all-events", async (req, res) => {
  try {
    await Event.deleteMany({}); // ลบทุกเอกสารใน collection
    res.status(200).json({ message: "ลบกิจกรรมทั้งหมดเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("❌ Error deleting all events:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบกิจกรรม" });
  }
});
/////////////////Save Image use Postman////////
app.post("/api/save-image", async (req, res) => {
  const { image, genres } = req.body;

  if (!image || !genres) {
    return res
      .status(400)
      .json({ error: "ต้องมีทั้ง image และ genres เป็น array" });
  }

  try {
    const newImageGenre = new ImageGenre({ image, genres });
    await newImageGenre.save();
    res
      .status(200)
      .json({ message: "บันทึกข้อมูลสำเร็จ", data: newImageGenre });
  } catch (error) {
    console.error("❌ Error saving to MongoDB:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึก" });
  }
});
//////////////Get Image Genres //////////
app.get("/api/get-image-genres", async (req, res) => {
  try {
    const imageGenres = await ImageGenre.find();
    res.status(200).json({ imageGenres });
  } catch (error) {
    console.error("❌ Error fetching image genres:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
});

// เริ่มต้นเซิร์ฟเวอร์
server.listen(port, () => console.log(`🚀 Server is running on port ${port}`));
