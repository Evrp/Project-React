import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import friendRequestRoutes from '../friendRequest.js';
import User from '../../src/model/userroom.js';
import FriendRequest from '../../src/model/friendRequest.js';

// เริ่มต้นเซิร์ฟเวอร์สำหรับทดสอบ
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api', friendRequestRoutes);

// Mock Socket.IO ด้วย objects ว่างเปล่า
app.set('io', {
  to: jest.fn().mockReturnValue({
    emit: jest.fn()
  })
});
app.set('userSockets', {});

let mongoServer;

// ตั้งค่า MongoDB Memory Server สำหรับการทดสอบ
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// ล้างข้อมูลในฐานข้อมูลหลังการทดสอบแต่ละครั้ง
afterEach(async () => {
  await User.deleteMany({});
  await FriendRequest.deleteMany({});
});

// ปิดการเชื่อมต่อกับฐานข้อมูลหลังการทดสอบทั้งหมด
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Friend Request API', () => {
  // ข้อมูลจำลองสำหรับการทดสอบ
  const testUser1 = {
    email: 'user1@example.com',
    displayName: 'User One',
    photoURL: 'https://example.com/photo1.jpg'
  };

  const testUser2 = {
    email: 'user2@example.com',
    displayName: 'User Two',
    photoURL: 'https://example.com/photo2.jpg'
  };

  // สร้างผู้ใช้ในฐานข้อมูลสำหรับการทดสอบ
  beforeEach(async () => {
    await new User({
      ...testUser1,
      friends: []
    }).save();

    await new User({
      ...testUser2,
      friends: []
    }).save();
  });

  test('POST /api/friend-request - ส่งคำขอเป็นเพื่อนสำเร็จ', async () => {
    const requestData = {
      from: testUser1,
      to: testUser2.email,
      timestamp: new Date().toISOString(),
      requestId: Date.now().toString(),
      roomId: 'room123'
    };

    const response = await request(app)
      .post('/api/friend-request')
      .send(requestData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('ส่งคำขอเพื่อนสำเร็จ');
    expect(response.body.requestId).toBeDefined();

    // ตรวจสอบว่าข้อมูลถูกบันทึกในฐานข้อมูลจริง
    const savedRequest = await FriendRequest.findOne({
      'from.email': testUser1.email,
      to: testUser2.email
    });
    expect(savedRequest).toBeTruthy();
    expect(savedRequest.status).toBe('pending');
  });

  test('POST /api/friend-request - ส่งคำขอถึงตัวเองไม่ได้', async () => {
    const requestData = {
      from: testUser1,
      to: testUser1.email,
      timestamp: new Date().toISOString(),
      requestId: Date.now().toString()
    };

    const response = await request(app)
      .post('/api/friend-request')
      .send(requestData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('ไม่สามารถส่งคำขอเพื่อนถึงตัวเองได้');
  });

  test('GET /api/friend-requests/:userEmail - ดึงข้อมูลคำขอเพื่อนสำเร็จ', async () => {
    // สร้างคำขอเพื่อนในฐานข้อมูลก่อน
    await new FriendRequest({
      requestId: Date.now().toString(),
      from: {
        email: testUser1.email,
        displayName: testUser1.displayName,
        photoURL: testUser1.photoURL
      },
      to: testUser2.email,
      status: 'pending',
      timestamp: new Date()
    }).save();

    const response = await request(app)
      .get(`/api/friend-requests/${testUser2.email}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.requests.length).toBe(1);
    expect(response.body.requests[0].from.email).toBe(testUser1.email);
    expect(response.body.requests[0].to).toBe(testUser2.email);
  });

  test('POST /api/friend-request-response - ยอมรับคำขอเพื่อนสำเร็จ', async () => {
    // สร้างคำขอเพื่อนในฐานข้อมูลก่อน
    const requestId = Date.now().toString();
    await new FriendRequest({
      requestId,
      from: {
        email: testUser1.email,
        displayName: testUser1.displayName,
        photoURL: testUser1.photoURL
      },
      to: testUser2.email,
      status: 'pending',
      timestamp: new Date()
    }).save();

    const responseData = {
      requestId,
      userEmail: testUser2.email,
      friendEmail: testUser1.email,
      response: 'accept',
      roomId: 'room123'
    };

    const response = await request(app)
      .post('/api/friend-request-response')
      .send(responseData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('ตอบรับคำขอเพื่อนสำเร็จ');

    // ตรวจสอบว่าคำขอถูกอัปเดตเป็น accepted
    const updatedRequest = await FriendRequest.findOne({ requestId });
    expect(updatedRequest.status).toBe('accepted');

    // ตรวจสอบว่าทั้งสองคนเป็นเพื่อนกันแล้ว
    const user1 = await User.findOne({ email: testUser1.email });
    const user2 = await User.findOne({ email: testUser2.email });
    
    expect(user1.friends.some(f => f.email === testUser2.email)).toBe(true);
    expect(user2.friends.some(f => f.email === testUser1.email)).toBe(true);
  });

  test('POST /api/friend-request-response - ปฏิเสธคำขอเพื่อนสำเร็จ', async () => {
    // สร้างคำขอเพื่อนในฐานข้อมูลก่อน
    const requestId = Date.now().toString();
    await new FriendRequest({
      requestId,
      from: {
        email: testUser1.email,
        displayName: testUser1.displayName,
        photoURL: testUser1.photoURL
      },
      to: testUser2.email,
      status: 'pending',
      timestamp: new Date()
    }).save();

    const responseData = {
      requestId,
      userEmail: testUser2.email,
      friendEmail: testUser1.email,
      response: 'decline'
    };

    const response = await request(app)
      .post('/api/friend-request-response')
      .send(responseData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('ปฏิเสธคำขอเพื่อนสำเร็จ');

    // ตรวจสอบว่าคำขอถูกอัปเดตเป็น declined
    const updatedRequest = await FriendRequest.findOne({ requestId });
    expect(updatedRequest.status).toBe('declined');
  });
});
