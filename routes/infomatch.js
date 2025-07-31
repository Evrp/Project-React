import express from "express";
import { InfoMatch } from "../src/model/infomatch.js";
// import { info } from "autoprefixer";
const router = express.Router();

// CREATE - สร้าง InfoMatch ใหม่
router.post("/infomatch/create", async (req, res) => {
  try {
    const { detail, email, chance, usermatch, emailjoined, usermatchjoined } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!detail || !email) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูล info และ email"
      });
    }

    const newInfoMatch = new InfoMatch({
      detail,
      email,
      emailjoined,
      usermatchjoined,
      chance: chance || 0,
      usermatch
    });

    const savedInfoMatch = await newInfoMatch.save();

    res.status(201).json({
      success: true,
      message: "สร้าง InfoMatch สำเร็จ",
      data: savedInfoMatch
    });
  } catch (error) {
    console.error("Error creating InfoMatch:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้าง InfoMatch",
      error: error.message
    });
  }
});

// READ - ดึงข้อมูล InfoMatch ทั้งหมด
router.get("/infomatch/all", async (req, res) => {
  try {
    const infoMatches = await InfoMatch.find();

    res.status(200).json({
      success: true,
      message: "ดึงข้อมูล InfoMatch สำเร็จ",
      count: infoMatches.length,
      data: infoMatches
    });
  } catch (error) {
    console.error("Error fetching InfoMatches:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล InfoMatch",
      error: error.message
    });
  }
});

// READ - ดึงข้อมูล InfoMatch ตาม Email
router.get("/infomatch/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const infoMatch = await InfoMatch.find({ email: email });

    if (!infoMatch) {
      return res.status(404).json({
        success: false,

        message: "ไม่พบ InfoMatch ที่ระบุ"
      });
    }

    res.status(200).json({
      success: true,
      infoCount: infoMatch.length,
      data: infoMatch
    });
  } catch (error) {
    console.error("Error fetching InfoMatch by ID:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล InfoMatch",
      error: error.message
    });
  }
});

// READ - ดึงข้อมูล InfoMatch ตาม email และเพื่อน
router.get("/infomatch/user/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Import Friend model
    const { default: Friend } = await import("../src/model/Friend.js");

    // หาเพื่อนทั้งหมดของผู้ใช้
    const friendships = await Friend.find({
      $or: [
        { requester: email },
        { recipient: email }
      ],
      status: 'accepted' // เฉพาะเพื่อนที่ยอมรับแล้ว
    });

    // สร้างรายการ email ของเพื่อน
    let friendEmails = [];
    friendships.forEach(friendship => {
      if (friendship.requester === email) {
        friendEmails.push(friendship.recipient);
      } else {
        friendEmails.push(friendship.requester);
      }
    });

    // เพิ่ม email ของผู้ใช้เองเข้าไปด้วย
    friendEmails.push(email);

    // หา InfoMatch ที่เกี่ยวข้องกับผู้ใช้และเพื่อน
    const infoMatches = await InfoMatch.find({
      $or: [
        { email: { $in: friendEmails } },
        { usermatch: { $in: friendEmails } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,

      count: infoMatches.length,
      friendsFound: friendEmails.length - 1, // ลบตัวผู้ใช้เองออก
      friendEmails: friendEmails.filter(e => e !== email), // แสดงเฉพาะ email เพื่อน
      data: infoMatches,
    });
  } catch (error) {
    console.error("Error fetching InfoMatches by email:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล InfoMatch ของผู้ใช้",
      error: error.message
    });
  }
});

// UPDATE - อัปเดต InfoMatch
router.put("/infomatch/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { detail, email, chance, usermatch, emailjoined, usermatchjoined } = req.body;
    
    const updatedInfoMatch = await InfoMatch.findByIdAndUpdate(
      id,
      {
        detail,
        email,
        chance,
        usermatch,
        emailjoined,
        usermatchjoined
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedInfoMatch) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ InfoMatch ที่ระบุ"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "อัปเดต InfoMatch สำเร็จ",
      data: updatedInfoMatch
    });
  } catch (error) {
    console.error("Error updating InfoMatch:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดต InfoMatch",
      error: error.message
    });
  }
});

// UPDATE - อัปเดต InfoMatch (เดิม)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { info, email, roomId, chance, usermatch } = req.body;

    const updatedInfoMatch = await InfoMatch.findByIdAndUpdate(
      id,
      {
        info,
        email,
        roomId,
        chance,
        usermatch
      },
      { new: true, runValidators: true }
    );

    if (!updatedInfoMatch) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ InfoMatch ที่ระบุ"
      });
    }

    res.status(200).json({
      success: true,
      message: "อัปเดต InfoMatch สำเร็จ",
      data: updatedInfoMatch
    });
  } catch (error) {
    console.error("Error updating InfoMatch:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดต InfoMatch",
      error: error.message
    });
  }
});

// UPDATE - อัปเดต chance
router.patch("/:id/chance", async (req, res) => {
  try {
    const { id } = req.params;
    const { chance } = req.body;

    if (typeof chance !== 'number') {
      return res.status(400).json({
        success: false,
        message: "chance ต้องเป็นตัวเลข"
      });
    }

    const updatedInfoMatch = await InfoMatch.findByIdAndUpdate(
      id,
      { chance },
      { new: true }
    );

    if (!updatedInfoMatch) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ InfoMatch ที่ระบุ"
      });
    }

    res.status(200).json({
      success: true,
      message: "อัปเดต chance สำเร็จ",
      data: updatedInfoMatch
    });
  } catch (error) {
    console.error("Error updating chance:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดต chance",
      error: error.message
    });
  }
});

// DELETE - ลบ InfoMatch
router.delete("/infomatch/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInfoMatch = await InfoMatch.findByIdAndDelete(id);

    if (!deletedInfoMatch) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ InfoMatch ที่ระบุ"
      });
    }

    res.status(200).json({
      success: true,
      message: "ลบ InfoMatch สำเร็จ",
      data: deletedInfoMatch
    });
  } catch (error) {
    console.error("Error deleting InfoMatch:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบ InfoMatch",
      error: error.message
    });
  }
});

// DELETE - ลบ InfoMatch ทั้งหมดของผู้ใช้
router.delete("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const result = await InfoMatch.deleteMany({ email });

    res.status(200).json({
      success: true,
      message: `ลบ InfoMatch ของผู้ใช้ ${email} สำเร็จ`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error deleting user InfoMatches:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบ InfoMatch ของผู้ใช้",
      error: error.message
    });
  }
});
router.delete("/infomatch", async (req, res) => {
  try {
    const deletedInfoMatch = await InfoMatch.deleteMany({});

    if (!deletedInfoMatch) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ InfoMatch ที่ระบุ"
      });
    }

    res.status(200).json({
      success: true,
      message: "ลบ InfoMatch สำเร็จ",
      data: deletedInfoMatch
    });
  } catch (error) {
    console.error("Error deleting InfoMatch:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบ InfoMatch",
      error: error.message
    });
  }
});

export default router;