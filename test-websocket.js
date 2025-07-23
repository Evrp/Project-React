// บันทึกไฟล์นี้เป็น test-websocket.js ในโฟลเดอร์โปรเจค
// ไฟล์นี้จะจำลองการเชื่อมต่อ WebSocket จากผู้ใช้หลายคนพร้อมกัน

// ต้องติดตั้ง socket.io-client ก่อนใช้ไฟล์นี้
// npm install socket.io-client

import { io } from "socket.io-client";

// เชื่อมต่อกับเซิร์ฟเวอร์ WebSocket
const socketURL = "http://localhost:8080"; // ปรับให้ตรงกับพอร์ตของคุณ

// จำลองผู้ใช้คนที่ 1
const user1 = {
  email: "user1@example.com",
  displayName: "User One",
  photoURL: "https://via.placeholder.com/50"
};

// จำลองผู้ใช้คนที่ 2
const user2 = {
  email: "user2@example.com",
  displayName: "User Two",
  photoURL: "https://via.placeholder.com/50"
};

// สร้างการเชื่อมต่อสำหรับผู้ใช้ 1
const socket1 = io(socketURL);
socket1.on("connect", () => {
  console.log(`ผู้ใช้ 1 เชื่อมต่อแล้ว: ${socket1.id}`);
  
  // แจ้งสถานะออนไลน์
  socket1.emit("user-online", user1);
  
  // รับการอัปเดตสถานะจากเซิร์ฟเวอร์
  socket1.on("update-users", (users) => {
    console.log("ผู้ใช้ 1 ได้รับอัปเดตผู้ใช้:", users);
  });
  
  socket1.on("user-offline", (userData) => {
    console.log("ผู้ใช้ 1 ได้รับแจ้งว่ามีคนออฟไลน์:", userData);
  });
  
  socket1.on("user-online", (userData) => {
    console.log("ผู้ใช้ 1 ได้รับแจ้งว่ามีคนออนไลน์:", userData);
  });
});

// รอ 2 วินาที แล้วเชื่อมต่อผู้ใช้ 2
setTimeout(() => {
  const socket2 = io(socketURL);
  
  socket2.on("connect", () => {
    console.log(`ผู้ใช้ 2 เชื่อมต่อแล้ว: ${socket2.id}`);
    
    // แจ้งสถานะออนไลน์
    socket2.emit("user-online", user2);
    
    // รับการอัปเดตสถานะจากเซิร์ฟเวอร์
    socket2.on("update-users", (users) => {
      console.log("ผู้ใช้ 2 ได้รับอัปเดตผู้ใช้:", users);
    });
    
    socket2.on("user-offline", (userData) => {
      console.log("ผู้ใช้ 2 ได้รับแจ้งว่ามีคนออฟไลน์:", userData);
    });
    
    socket2.on("user-online", (userData) => {
      console.log("ผู้ใช้ 2 ได้รับแจ้งว่ามีคนออนไลน์:", userData);
    });
    
    // 10 วินาทีหลังจากนั้น ให้ผู้ใช้ 2 ออฟไลน์
    setTimeout(() => {
      console.log("ผู้ใช้ 2 กำลังออฟไลน์...");
      socket2.emit("user-offline", { email: user2.email });
      
      // 2 วินาทีหลังจากนั้น ปิดการเชื่อมต่อ
      setTimeout(() => {
        socket2.disconnect();
        console.log("ผู้ใช้ 2 ปิดการเชื่อมต่อแล้ว");
      }, 2000);
    }, 10000);
  });
}, 2000);

// 30 วินาทีหลังจากนั้น ปิดการเชื่อมต่อของผู้ใช้ 1
setTimeout(() => {
  console.log("ผู้ใช้ 1 กำลังออฟไลน์...");
  socket1.emit("user-offline", { email: user1.email });
  
  // 2 วินาทีหลังจากนั้น ปิดการเชื่อมต่อ
  setTimeout(() => {
    socket1.disconnect();
    console.log("ผู้ใช้ 1 ปิดการเชื่อมต่อแล้ว");
    
    // จบการทำงานของโปรแกรม
    setTimeout(() => {
      console.log("จบการทดสอบ WebSocket");
      process.exit(0);
    }, 1000);
  }, 2000);
}, 30000);

// ในกรณีใช้ ESM modules จำเป็นต้องเพิ่ม export default
export default {};
