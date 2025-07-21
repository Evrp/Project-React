import express from "express";
const router = express.Router();
import User from "../src/model/userroom.js";

// ดึงข้อมูลเพื่อนของผู้ใช้
router.get("/friends/:email", async (req, res) => {
    const { email } = req.params;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
        
        // หากไม่มีข้อมูลเพื่อน ให้ส่งอาร์เรย์ว่าง
        const friends = user.friends || [];
        
        // ดึงข้อมูลเพื่อนเพิ่มเติมจาก User
        const friendDetails = [];
        for (const friend of friends) {
            const friendData = await User.findOne({ email: friend.email });
            if (friendData) {
                friendDetails.push({
                    email: friend.email,
                    displayName: friendData.displayName,
                    photoURL: friendData.photoURL,
                    roomId: friend.roomId
                });
            }
        }
        
        res.status(200).json({ success: true, friends: friendDetails });
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลเพื่อน:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลเพื่อน", error: error.message });
    }
});

// ลบเพื่อน
router.delete("/remove-friend", async (req, res) => {
    const { userEmail, friendEmail } = req.body;
    
    if (!userEmail || !friendEmail) {
        return res.status(400).json({ success: false, message: "ต้องระบุอีเมลของผู้ใช้และเพื่อน" });
    }
    
    try {
        // ดึงข้อมูลผู้ใช้
        const user = await User.findOne({ email: userEmail });
        const friend = await User.findOne({ email: friendEmail });
        
        if (!user) {
            return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
        }
        
        if (!friend) {
            return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้ที่เป็นเพื่อน" });
        }
        
        // ลบเพื่อนออกจากรายการเพื่อนของผู้ใช้
        if (user.friends && user.friends.length > 0) {
            user.friends = user.friends.filter(f => f.email !== friendEmail);
        }
        
        // ลบผู้ใช้ออกจากรายการเพื่อนของเพื่อน
        if (friend.friends && friend.friends.length > 0) {
            friend.friends = friend.friends.filter(f => f.email !== userEmail);
        }
        
        // บันทึกการเปลี่ยนแปลง
        await user.save();
        await friend.save();
        
        // ส่งการแจ้งเตือนผ่าน socket server (ถ้ามี)
        if (req.app.get('io')) {
            const io = req.app.get('io');
            const userSockets = req.app.get('userSockets') || {};
            const recipientSocket = userSockets[friendEmail];
            
            if (recipientSocket) {
                io.to(recipientSocket).emit('notify-friend-remove', { from: userEmail });
            }
        }
        
        res.status(200).json({ 
            success: true, 
            message: "ลบเพื่อนสำเร็จ", 
            friends: user.friends 
        });
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการลบเพื่อน:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการลบเพื่อน", error: error.message });
    }
});

export default router;
