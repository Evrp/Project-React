import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { Product } from "./models/product.js";
import { User } from "./models/user.js";

const app = express();
const port = 8080;

app.use(cors());
app.use(bodyParser.json());

const AMAZON_URL =
  "https://www.amazon.com/MSI-Codex-Gaming-Desktop-A8NUE-274US/dp/B0DGHPPL1M/";
const MAKE_WEBHOOK_URL =
  "https://hook.eu2.make.com/6f59e6trmyro1tcn6ridueeluiutsz3j";
const uri =
  "mongodb+srv://Peerapat:hmcSoODK3PW81gIm@projecttest1.53764sf.mongodb.net/?"; // คัดลอกจาก MongoDB Atlas
mongoose.connect(uri, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once("open", () => {
  console.log("🔥 MongoDB Connected");
});
db.on("error", (err) => {
  console.error("❌ MongoDB Error:", err);
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

    await product.save(); // ✅ บันทึกลง MongoDB
    res.json(product); // ✅ ส่งข้อมูลกลับไปที่ Client
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

app.listen(port, () => {
  console.log(`Express.js รันที่ http://localhost:${port}`);
});