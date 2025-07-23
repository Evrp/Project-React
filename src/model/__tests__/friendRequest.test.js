import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import FriendRequest from '../../src/model/friendRequest.js';

let mongoServer;

// ตั้งค่า MongoDB Memory Server สำหรับการทดสอบ
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// ล้างข้อมูลในฐานข้อมูลหลังการทดสอบแต่ละครั้ง
afterEach(async () => {
  await FriendRequest.deleteMany({});
});

// ปิดการเชื่อมต่อกับฐานข้อมูลหลังการทดสอบทั้งหมด
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('FriendRequest Model', () => {
  // ข้อมูลจำลองสำหรับการทดสอบ
  const validFriendRequest = {
    requestId: 'req123',
    from: {
      email: 'sender@example.com',
      displayName: 'Sender',
      photoURL: 'https://example.com/sender.jpg'
    },
    to: 'receiver@example.com',
    timestamp: new Date(),
    status: 'pending',
    roomId: 'room123'
  };

  test('สร้างคำขอเพื่อนที่ถูกต้องสำเร็จ', async () => {
    const friendRequest = new FriendRequest(validFriendRequest);
    const savedFriendRequest = await friendRequest.save();
    
    expect(savedFriendRequest.requestId).toBe(validFriendRequest.requestId);
    expect(savedFriendRequest.from.email).toBe(validFriendRequest.from.email);
    expect(savedFriendRequest.to).toBe(validFriendRequest.to);
    expect(savedFriendRequest.status).toBe('pending');
    expect(savedFriendRequest.read).toBe(false); // ค่าเริ่มต้น
  });

  test('ไม่อนุญาตให้สร้างคำขอเพื่อนที่ไม่มี requestId', async () => {
    const invalidFriendRequest = {
      ...validFriendRequest,
      requestId: undefined
    };

    const friendRequest = new FriendRequest(invalidFriendRequest);
    
    await expect(friendRequest.save()).rejects.toThrow();
  });

  test('ไม่อนุญาตให้สร้างคำขอเพื่อนที่ไม่มี email ของผู้ส่ง', async () => {
    const invalidFriendRequest = {
      ...validFriendRequest,
      from: {
        ...validFriendRequest.from,
        email: undefined
      }
    };

    const friendRequest = new FriendRequest(invalidFriendRequest);
    
    await expect(friendRequest.save()).rejects.toThrow();
  });

  test('ไม่อนุญาตให้สร้างคำขอเพื่อนที่ไม่มี email ของผู้รับ', async () => {
    const invalidFriendRequest = {
      ...validFriendRequest,
      to: undefined
    };

    const friendRequest = new FriendRequest(invalidFriendRequest);
    
    await expect(friendRequest.save()).rejects.toThrow();
  });

  test('อัปเดตสถานะของคำขอเพื่อนเป็น accepted สำเร็จ', async () => {
    const friendRequest = new FriendRequest(validFriendRequest);
    await friendRequest.save();
    
    // อัปเดตสถานะ
    friendRequest.status = 'accepted';
    const updatedRequest = await friendRequest.save();
    
    expect(updatedRequest.status).toBe('accepted');
  });

  test('อัปเดตสถานะของคำขอเพื่อนเป็น declined สำเร็จ', async () => {
    const friendRequest = new FriendRequest(validFriendRequest);
    await friendRequest.save();
    
    // อัปเดตสถานะ
    friendRequest.status = 'declined';
    const updatedRequest = await friendRequest.save();
    
    expect(updatedRequest.status).toBe('declined');
  });

  test('ไม่อนุญาตให้ตั้งสถานะเป็นค่าที่ไม่ได้กำหนด', async () => {
    const friendRequest = new FriendRequest(validFriendRequest);
    await friendRequest.save();
    
    // ลองตั้งสถานะเป็นค่าที่ไม่ได้กำหนด
    friendRequest.status = 'invalid_status';
    
    await expect(friendRequest.save()).rejects.toThrow();
  });

  test('ไม่อนุญาตให้สร้างคำขอเพื่อนซ้ำระหว่างผู้ส่งและผู้รับเดียวกัน', async () => {
    // สร้างคำขอแรก
    const firstRequest = new FriendRequest(validFriendRequest);
    await firstRequest.save();
    
    // พยายามสร้างคำขอซ้ำ
    const duplicateRequest = new FriendRequest({
      ...validFriendRequest,
      requestId: 'different_id' // เปลี่ยน requestId แต่ from.email และ to ยังเหมือนเดิม
    });
    
    await expect(duplicateRequest.save()).rejects.toThrow();
  });
});
