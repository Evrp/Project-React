# วิธีทดสอบระบบ WebSocket แบบมืออาชีพ

คู่มือนี้จะแนะนำวิธีทดสอบระบบ WebSocket (Socket.io) ในโปรเจคของคุณอย่างละเอียด เพื่อให้มั่นใจว่าระบบสามารถทำงานได้ในสภาวะจริง

## เครื่องมือที่เตรียมไว้ให้

1. **websocket-test-suite.js** - สคริปต์ทดสอบ WebSocket แบบสมบูรณ์ สามารถจำลองผู้ใช้หลายคนและทำ load testing ได้
2. **websocket-visual-monitor.js** - มอนิเตอร์แบบ real-time สำหรับดูสถานะและกิจกรรม WebSocket
3. **test-websocket.js** - สคริปต์ทดสอบแบบง่าย สำหรับเริ่มต้นทดสอบอย่างรวดเร็ว

## ขั้นตอนการติดตั้งและเตรียมการ

1. ติดตั้ง dependencies ที่จำเป็น:
```bash
cd c:\Users\User\Project-React
npm install socket.io-client chalk blessed
```

2. ตรวจสอบว่าไฟล์ .env มีตัวแปร VITE_APP_API_BASE_URL ที่ชี้ไปที่ URL ของเซิร์ฟเวอร์ Socket.io

## วิธีทดสอบ

### 1. ทดสอบขั้นพื้นฐาน

เริ่มต้นด้วยการทดสอบอย่างง่ายเพื่อให้แน่ใจว่า WebSocket ทำงานถูกต้อง:

```bash
# รันเซิร์ฟเวอร์ในเทอร์มินัลหนึ่ง
cd c:\Users\User\Project-React
node server.js

# รันสคริปต์ทดสอบในอีกเทอร์มินัลหนึ่ง
cd c:\Users\User\Project-React
node test-websocket.js
```

สังเกตผลลัพธ์ในคอนโซล คุณควรเห็นข้อความว่าผู้ใช้เชื่อมต่อสำเร็จ และมีการส่งข้อมูลสถานะ online/offline

### 2. ทดสอบแบบ Visual Monitor

ใช้เครื่องมือ Visual Monitor เพื่อดูการทำงานของ WebSocket แบบ real-time:

```bash
# รันเซิร์ฟเวอร์ในเทอร์มินัลหนึ่ง
cd c:\Users\User\Project-React
node server.js

# รันแอพพลิเคชันในเทอร์มินัลที่สอง
cd c:\Users\User\Project-React
npm run dev

# รัน Visual Monitor ในเทอร์มินัลที่สาม
cd c:\Users\User\Project-React
node websocket-visual-monitor.js
```

คุณจะเห็นหน้าจอแสดงสถานะการเชื่อมต่อ สถิติ และกิจกรรม WebSocket ในแบบ real-time
- กด 'q' หรือ ESC เพื่อออกจาก monitor
- กด 'r' เพื่อ reset สถิติ

### 3. ทดสอบ Load และ Performance

ใช้เครื่องมือ Test Suite เพื่อทดสอบประสิทธิภาพของระบบภายใต้โหลดสูง:

```bash
# รันเซิร์ฟเวอร์ในเทอร์มินัลหนึ่ง
cd c:\Users\User\Project-React
node server.js

# รัน Test Suite ในเทอร์มินัลที่สอง
# รูปแบบ: node websocket-test-suite.js [จำนวนผู้ใช้] [ความล่าช้าระหว่างการเชื่อมต่อ ms]
cd c:\Users\User\Project-React
node websocket-test-suite.js 20 500
```

ทดสอบโหลดโดยเพิ่มจำนวนผู้ใช้:
- ทดสอบกับผู้ใช้ 10 คน: `node websocket-test-suite.js 10 500`
- ทดสอบกับผู้ใช้ 50 คน: `node websocket-test-suite.js 50 200`
- ทดสอบกับผู้ใช้ 100 คน: `node websocket-test-suite.js 100 100` (อาจต้องการคอมพิวเตอร์ที่มีประสิทธิภาพสูง)

### 4. ทดสอบในสภาพแวดล้อมจริง

1. เปิดแอพพลิเคชันใน 2 เบราว์เซอร์ที่แตกต่างกัน (หรือใช้โหมดไม่ระบุตัวตนในเบราว์เซอร์เดียวกัน)

2. ล็อกอินด้วยบัญชีที่แตกต่างกันในแต่ละเบราว์เซอร์

3. ไปที่หน้า Friend ในทั้งสองเบราว์เซอร์ และทดสอบ:
   - ตรวจสอบว่าสถานะ "ออนไลน์" แสดงอย่างถูกต้อง
   - ปิดเบราว์เซอร์หนึ่ง และดูว่าอีกเบราว์เซอร์หนึ่งแสดงสถานะ "ออฟไลน์" อย่างถูกต้อง
   - ตรวจสอบว่า "เห็นล่าสุด" แสดงเวลาที่ถูกต้อง

## การแก้ไขปัญหาที่พบบ่อย

1. **WebSocket ไม่เชื่อมต่อ**:
   - ตรวจสอบว่า URL เซิร์ฟเวอร์ถูกต้อง
   - เช็ค CORS settings ในเซิร์ฟเวอร์
   - เปิด Developer Console (F12) เพื่อดูข้อผิดพลาด

2. **สถานะไม่อัพเดท**:
   - ตรวจสอบว่ามีการเรียก `socket.emit('user-online')` เมื่อล็อกอิน
   - ตรวจสอบว่ามีการเรียก `socket.emit('user-offline')` ก่อน disconnect
   - ดู logs ในเซิร์ฟเวอร์เพื่อดูว่าได้รับ events หรือไม่

3. **Last Seen ไม่ทำงาน**:
   - ตรวจสอบว่ามีการส่งข้อมูล timestamp จากเซิร์ฟเวอร์
   - ตรวจสอบฟังก์ชัน `formatLastSeen` ทำงานถูกต้อง

4. **ประสิทธิภาพช้า**:
   - ลดความถี่ในการส่ง events
   - ตรวจสอบว่าไม่มี memory leaks (เช่น event listeners ที่ไม่ได้ล้าง)
   - เพิ่ม Socket.io options สำหรับประสิทธิภาพที่ดีขึ้น:
     ```javascript
     const socket = io(url, {
       transports: ['websocket'],
       upgrade: false,
       forceNew: true
     });
     ```

## เทคนิคขั้นสูงสำหรับการทดสอบ

1. **ทดสอบ Reconnection**:
   - ปิดเซิร์ฟเวอร์ชั่วคราว และเปิดขึ้นมาใหม่เพื่อทดสอบการเชื่อมต่อใหม่อัตโนมัติ
   - ใช้ network throttling ใน Chrome DevTools เพื่อจำลองการเชื่อมต่อที่ไม่เสถียร

2. **ทดสอบ Event Broadcasting**:
   - ตรวจสอบว่า events ส่งไปถึงทุกคนที่ควรได้รับ
   - ตรวจสอบว่า events ไม่ส่งไปยังผู้ใช้ที่ไม่ควรได้รับ

3. **ทดสอบ Security**:
   - ตรวจสอบว่าผู้ใช้ที่ไม่ได้รับอนุญาตไม่สามารถส่ง events ได้
   - ตรวจสอบว่าข้อมูลที่ส่งมีการตรวจสอบความถูกต้อง

หวังว่าคู่มือนี้จะช่วยให้คุณสามารถทดสอบระบบ WebSocket ได้อย่างมีประสิทธิภาพและมั่นใจในการนำไปใช้งานจริง!

## References
- [Socket.io Documentation](https://socket.io/docs/)
- [Socket.io Client API](https://socket.io/docs/v4/client-api/)
- [Socket.io Testing](https://socket.io/docs/v4/testing/)
