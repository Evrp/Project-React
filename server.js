import express from "express";
import cors from "cors";
import axios from "axios";
import puppeteer from "puppeteer";
import bodyParser from "body-parser";

const app = express();
const port = 8080;

app.use(cors());
app.use(bodyParser.json());

const USER_WEBHOOK_URL = "https://hook.eu2.make.com/u94lu8f6qjsum5qqtq5nb884d8cnf2pa";
const SCRAPING_WEBHOOK_URL = "https://hook.eu2.make.com/u94lu8f6qjsum5qqtq5nb884d8cnf2pa";

// 📌 1️⃣ ดึงข้อมูลจาก Ticketmelon (Web Scraping)
app.get('/api/events', async (req, res) => {
  try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto("https://www.netflix.com/th/", { waitUntil: "networkidle2" });

      const pageData = await page.evaluate(() => {
          const events = Array.from(document.querySelectorAll(".event-card")).map((event) => {
              const title = event.querySelector(".event-title")?.innerText.trim() || "ไม่มีชื่อกิจกรรม";
              const location = event.querySelector(".event-location")?.innerText.trim() || "ไม่ระบุสถานที่";
              const date = event.querySelector(".event-date")?.innerText.trim() || "ไม่ระบุวันที่";
              return { title, location, date };
          });

          return { events };
      });

      await browser.close();

      // ส่งข้อมูลที่ดึงได้ไปที่ Webhook
      await axios.post(SCRAPING_WEBHOOK_URL, { events_info: pageData.events });

      res.json({
          status: "success",
          data: pageData.events
      });
  } catch (error) {
      console.error("Error scraping Ticketmelon:", error);
      res.status(500).json({ error: "ไม่สามารถดึงข้อมูลจาก Ticketmelon ได้" });
  }
});

// 📌 2️⃣ รับข้อมูลจาก Frontend และส่งไปยัง Make.com
app.post("/api/send-to-make", async (req, res) => {
  try {
    const { interest, location, date, budget } = req.body;

    const payload = {
      user_info: { interest, location, date, budget }
    };

    await axios.post(USER_WEBHOOK_URL, payload);

    res.json({ message: "ส่งข้อมูลไปยัง Make.com สำเร็จ" });
  } catch (error) {
    console.error("Error sending data to Make.com:", error);
    res.status(500).json({ error: "ไม่สามารถส่งข้อมูลไปยัง Make.com ได้" });
  }
});

// 📌 3️⃣ ส่งข้อมูลผู้ใช้ + Web Scraping ไปยัง Make.com (แยกสองหัวข้อ)
app.post("/api/send-to-make-combined", async (req, res) => {
  try {
    const { userData, eventsData } = req.body;

    const payload = {
      user_info: userData,
      events_info: eventsData
    };

    await axios.post(SCRAPING_WEBHOOK_URL, payload);

    res.json({ message: "ส่งข้อมูลไปยัง Make.com สำเร็จ" });
  } catch (error) {
    console.error("Error sending combined data to Make.com:", error);
    res.status(500).json({ error: "ไม่สามารถส่งข้อมูลไปยัง Make.com ได้" });
  }
});

app.listen(port, () => {
  console.log(`Express.js รันที่ http://localhost:${port}`);
});
