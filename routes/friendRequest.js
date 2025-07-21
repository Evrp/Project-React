import express from "express";
const router = express.Router();
import User from '../src/model/userroom.js';
import Friend from "../src/model/Friend.js";
import FriendRequest from "../src/model/friendRequest.js";
import { isValidObjectId } from 'mongoose';

// API สำหรับส่งคำขอเป็นเพื่อน
router.post('/friend-request', async (req, res) => {
  try {
    const { from, to, requestId, timestamp, type, roomId } = req.body;

    // ตรวจสอบว่า email ไม่เป็นค่าว่าง
    if (!from.email || !to) {
      return res.status(400).json({ success: false, message: 'Email ผู้ส่งและผู้รับจำเป็นต้องระบุ' });
    }

    // ตรวจสอบว่าเป็น email เดียวกันหรือไม่
    if (from.email === to) {
      return res.status(400).json({ success: false, message: 'ไม่สามารถส่งคำขอเพื่อนถึงตัวเองได้' });
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const toUser = await Friend.findOne({ email: to });
    if (!toUser) {
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้ปลายทาง' });
    }

    // ตรวจสอบว่าเป็นเพื่อนกันแล้วหรือไม่
    const fromUser = await Friend.findOne({ email: from.email });
    if (!fromUser) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ส่ง' });
    }

    // ตรวจสอบว่าเป็นเพื่อนกันอยู่แล้วหรือไม่
    const alreadyFriends = fromUser.friends && fromUser.friends.some(friend => friend.email === to);
    if (alreadyFriends) {
      return res.status(400).json({ success: false, message: 'ทั้งสองคนเป็นเพื่อนกันอยู่แล้ว' });
    }

    // ตรวจสอบว่ามีคำขอเพื่อนระหว่างกันอยู่แล้วหรือไม่
    const existingRequest = await FriendRequest.findOne({ 
      'from.email': from.email,
      'to': to,
      'status': 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'มีคำขอเพื่อนที่ยังไม่ได้ตอบรับอยู่แล้ว' });
    }

    // สร้างคำขอเพื่อนใหม่
    const newFriendRequest = new FriendRequest({
      requestId: requestId || Date.now().toString(),
      from: {
        email: from.email,
        displayName: from.displayName,
        photoURL: from.photoURL
      },
      to,
      timestamp: timestamp || new Date(),
      status: 'pending',
      roomId
    });

    await newFriendRequest.save();

    // ส่งการแจ้งเตือนผ่าน socket server (จะจัดการในไฟล์ server.js)
    if (req.app.get('io')) {
      const io = req.app.get('io');
      const userSockets = req.app.get('userSockets') || {};
      const recipientSocket = userSockets[to];
      
      if (recipientSocket) {
        io.to(recipientSocket).emit('notify-friend-request', { from: from.email });
      }
    }

    res.status(201).json({ 
      success: true, 
      message: 'ส่งคำขอเพื่อนสำเร็จ', 
      requestId: newFriendRequest.requestId 
    });

  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการส่งคำขอเพื่อน:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการส่งคำขอเพื่อน', error: error.message });
  }
});

// API ดึงข้อมูลคำขอเพื่อนของผู้ใช้
router.get('/friend-requests/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;

    // ดึงคำขอเพื่อนที่ถูกส่งมาถึงผู้ใช้
    const requests = await FriendRequest.find({ 
      to: userEmail,
      status: 'pending'
    }).sort({ timestamp: -1 });

    res.status(200).json({ 
      success: true, 
      requests: requests.map(req => ({
        requestId: req.requestId,
        from: req.from,
        to: req.to,
        timestamp: req.timestamp,
        status: req.status,
        read: req.read
      }))
    });

  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลคำขอเพื่อน:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำขอเพื่อน', error: error.message });
  }
});

// API สำหรับตอบรับหรือปฏิเสธคำขอเพื่อน
router.post('/friend-request-response', async (req, res) => {
  try {
    const { requestId, userEmail, friendEmail, response, roomId } = req.body;

    if (!requestId || !userEmail || !friendEmail || !response) {
      return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
    }

    // ดึงคำขอเพื่อนจากฐานข้อมูล
    const friendRequest = await FriendRequest.findOne({ requestId });
    
    if (!friendRequest) {
      return res.status(404).json({ success: false, message: 'ไม่พบคำขอเพื่อนนี้' });
    }

    if (friendRequest.to !== userEmail) {
      return res.status(403).json({ success: false, message: 'คุณไม่มีสิทธิ์ตอบรับคำขอเพื่อนนี้' });
    }

    // อัปเดตสถานะของคำขอ
    friendRequest.status = response === 'accept' ? 'accepted' : 'declined';
    friendRequest.read = true;
    await friendRequest.save();

    // ถ้าตอบรับ ให้เพิ่มเป็นเพื่อนในฐานข้อมูล
    if (response === 'accept') {
      // ดึงข้อมูลผู้ใช้ทั้งสองคน
      const user = await User.findOne({ email: userEmail });
      const friend = await User.findOne({ email: friendEmail });

      if (!user || !friend) {
        return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้' });
      }

      // เพิ่มเพื่อนให้กับทั้งสองฝ่าย
      // ตรวจสอบว่ามีอาร์เรย์เพื่อนหรือไม่ ถ้าไม่มีให้สร้างใหม่
      if (!user.friends) user.friends = [];
      if (!friend.friends) friend.friends = [];

      // ตรวจสอบว่าเป็นเพื่อนกันอยู่แล้วหรือไม่
      const userAlreadyFriend = user.friends.some(f => f.email === friendEmail);
      const friendAlreadyFriend = friend.friends.some(f => f.email === userEmail);

      // เพิ่มเพื่อนให้กับผู้ใช้ถ้ายังไม่เป็นเพื่อนกัน
      if (!userAlreadyFriend) {
        user.friends.push({ 
          email: friendEmail,
          roomId: roomId || friendRequest.roomId
        });
      }

      // เพิ่มเพื่อนให้กับเพื่อนถ้ายังไม่เป็นเพื่อนกัน
      if (!friendAlreadyFriend) {
        friend.friends.push({
          email: userEmail,
          roomId: roomId || friendRequest.roomId
        });
      }

      // บันทึกข้อมูลลงฐานข้อมูล
      await user.save();
      await friend.save();

      // ส่งการแจ้งเตือนผ่าน socket server
      if (req.app.get('io')) {
        const io = req.app.get('io');
        const userSockets = req.app.get('userSockets') || {};
        const recipientSocket = userSockets[friendEmail];
        
        if (recipientSocket) {
          io.to(recipientSocket).emit('notify-friend-accept', { from: userEmail });
        }
      }

      res.status(200).json({ 
        success: true, 
        message: 'ตอบรับคำขอเพื่อนสำเร็จ',
        user: {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
      });
    } else {
      res.status(200).json({ success: true, message: 'ปฏิเสธคำขอเพื่อนสำเร็จ' });
    }

  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการตอบรับคำขอเพื่อน:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการตอบรับคำขอเพื่อน', error: error.message });
  }
});

// API สำหรับดึงข้อมูลการยอมรับคำขอเพื่อนล่าสุด (สำหรับแสดง Toast)
router.get('/friend-accepts/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;

    // ดึงคำขอเพื่อนที่ถูกยอมรับล่าสุดที่ผู้ใช้เป็นผู้ส่ง
    const latestAccept = await FriendRequest.findOne({
      'from.email': userEmail,
      'status': 'accepted'
    }).sort({ updatedAt: -1 }).limit(1);

    if (!latestAccept) {
      return res.status(200).json({ success: true, latestAccept: null });
    }

    // ดึงข้อมูลผู้ใช้ที่ยอมรับคำขอ
    const acceptedUser = await User.findOne({ email: latestAccept.to });

    if (!acceptedUser) {
      return res.status(200).json({ success: true, latestAccept: null });
    }

    res.status(200).json({ 
      success: true, 
      latestAccept: {
        email: acceptedUser.email,
        displayName: acceptedUser.displayName,
        photoURL: acceptedUser.photoURL,
        timestamp: latestAccept.updatedAt
      }
    });

  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลการยอมรับคำขอเพื่อน:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการยอมรับคำขอเพื่อน', error: error.message });
  }
});

export default router;
