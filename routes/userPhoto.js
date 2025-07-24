import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { UserPhoto } from "../src/model/userPhoto.js";

const router = express.Router();

// Test route to check if userPhoto routes are accessible
router.get("/test-photo-route", (req, res) => {
  res.json({ success: true, message: "Photo routes are working!" });
});

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads", "user-photos");
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น"), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Upload user photo
router.post("/upload-user-photo", upload.single("photo"), async (req, res) => {
  console.log("Upload photo API called", req.file, req.body);
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "ไม่พบไฟล์รูปภาพ" 
      });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "ไม่พบอีเมลผู้ใช้"
      });
    }

    // Create a URL for the uploaded file
    const fileUrl = `/uploads/user-photos/${req.file.filename}`;
    
    // Create a new user photo record
    const newPhoto = new UserPhoto({
      email,
      url: fileUrl,
      filename: req.file.filename,
      title: req.body.title || `รูปภาพ ${Date.now()}`
    });

    await newPhoto.save();

    res.status(201).json({
      success: true,
      message: "อัปโหลดรูปภาพสำเร็จ",
      photo: {
        id: newPhoto._id,
        url: newPhoto.url,
        title: newPhoto.title,
        createdAt: newPhoto.createdAt
      }
    });
  } catch (error) {
    console.error("❌ Error uploading user photo:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ"
    });
  }
});

// Get user photos
router.get("/user-photos/:email", async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "ไม่พบอีเมลผู้ใช้"
      });
    }

    const photos = await UserPhoto.find({ email })
      .sort({ createdAt: -1 }) // Sort by newest first
      .select("_id url title createdAt");

    res.status(200).json({
      success: true,
      photos: photos.map(photo => ({
        id: photo._id,
        url: photo.url,
        title: photo.title,
        createdAt: photo.createdAt
      }))
    });
  } catch (error) {
    console.error("❌ Error fetching user photos:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ"
    });
  }
});

// Delete user photo
router.delete("/user-photo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    if (!id || !email) {
      return res.status(400).json({
        success: false,
        message: "ไม่พบข้อมูลที่จำเป็น"
      });
    }

    // Find the photo first to get the filename
    const photo = await UserPhoto.findOne({ _id: id, email });
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรูปภาพที่ต้องการลบ"
      });
    }

    // Delete the photo record from the database
    await UserPhoto.deleteOne({ _id: id, email });
    
    // Delete the actual file if exists
    if (photo.filename) {
      const filePath = path.join(process.cwd(), "uploads", "user-photos", photo.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(200).json({
      success: true,
      message: "ลบรูปภาพสำเร็จ"
    });
  } catch (error) {
    console.error("❌ Error deleting user photo:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบรูปภาพ"
    });
  }
});

// Export the router - make sure this line is correct
export default router;
