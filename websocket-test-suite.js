/**
 * WebSocket Test Suite สำหรับทดสอบระบบ Socket.io
 * สามารถทดสอบการเชื่อมต่อหลายคนพร้อมกัน และทำ load testing ได้
 * 
 * วิธีใช้: node websocket-test-suite.js [จำนวน users] [ความล่าช้าระหว่างการเชื่อมต่อ ms] [ระยะเวลาทดสอบ วินาที]
 * ตัวอย่าง: 
 *   - node websocket-test-suite.js 10 500 
 *     (ทดสอบ 10 คน, เชื่อมต่อทุก 500ms, ทดสอบเป็นเวลา 30 วินาที)
 *   - node websocket-test-suite.js 20 200 60
 *     (ทดสอบ 20 คน, เชื่อมต่อทุก 200ms, ทดสอบเป็นเวลา 60 วินาที)
 */

import { io } from 'socket.io-client';
import chalk from 'chalk'; // ต้องติดตั้งก่อน: npm install chalk
import { performance } from 'perf_hooks';
import os from 'os';

// Configuration
const DEFAULT_USERS = 5;
const DEFAULT_DELAY = 1000; // 1 วินาที
const DEFAULT_DURATION = 30000; // 30 วินาที
const SOCKET_URL = process.env.VITE_APP_API_BASE_URL;

// รับพารามิเตอร์จาก command line
// รูปแบบ: node websocket-test-suite.js [จำนวนผู้ใช้] [ดีเลย์ ms] [ระยะเวลาทดสอบ s]
const userCount = parseInt(process.argv[2], 10) || DEFAULT_USERS;
const connectionDelay = parseInt(process.argv[3], 10) || DEFAULT_DELAY;
// รับพารามิเตอร์ที่ 3 เป็นระยะเวลาทดสอบในหน่วยวินาที และแปลงเป็น ms
const TEST_DURATION = (parseInt(process.argv[4], 10) || DEFAULT_DURATION/1000) * 1000;

console.log(chalk.blue('==============================================='));
console.log(chalk.blue('📊 WebSocket Test Suite - Professional Edition'));
console.log(chalk.blue('==============================================='));
console.log(chalk.yellow(`🔌 เชื่อมต่อไปยัง: ${SOCKET_URL}`));
console.log(chalk.yellow(`👥 จำนวนผู้ใช้จำลอง: ${userCount}`));
console.log(chalk.yellow(`⏱️ ความล่าช้าระหว่างการเชื่อมต่อ: ${connectionDelay}ms`));
console.log(chalk.yellow(`⌛ ระยะเวลาทดสอบ: ${TEST_DURATION/1000} วินาที`));
console.log(chalk.gray(`💡 การใช้งาน: node websocket-test-suite.js [จำนวนผู้ใช้] [ดีเลย์ ms] [ระยะเวลาทดสอบ วินาที]`));
console.log(chalk.blue('===============================================\n'));

// เก็บสถิติ
const stats = {
  connectSuccess: 0,
  connectFail: 0,
  messagesReceived: 0,
  messagesSent: 0,
  errors: [],
  latency: [],
  startTime: performance.now(),
  endTime: null
};

// สร้าง array เก็บ connections
const connections = [];
const socketEvents = {};

// เช็คทรัพยากรระบบ
function logSystemResources() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsage = process.memoryUsage();
  
  console.log(chalk.cyan('\n📈 ทรัพยากรระบบ:'));
  console.log(chalk.cyan(`   CPU Load: ${os.loadavg()[0].toFixed(2)}%`));
  console.log(chalk.cyan(`   Memory: ${Math.round(usedMem/1024/1024)}MB / ${Math.round(totalMem/1024/1024)}MB (${(usedMem/totalMem*100).toFixed(2)}%)`));
  console.log(chalk.cyan(`   Node.js Heap: ${Math.round(memUsage.heapUsed/1024/1024)}MB / ${Math.round(memUsage.heapTotal/1024/1024)}MB`));
}

// สร้างข้อมูลผู้ใช้จำลอง
function createMockUser(id) {
  return {
    email: `test${id}@example.com`,
    displayName: `Test User ${id}`,
    photoURL: `https://randomuser.me/api/portraits/men/${id % 100}.jpg`
  };
}

// แสดง progress bar สำหรับการเชื่อมต่อ
function printProgressBar(current, total) {
  const percent = Math.round((current / total) * 100);
  const filledLength = Math.round(40 * current / total);
  const bar = '█'.repeat(filledLength) + '-'.repeat(40 - filledLength);
  
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(chalk.green(`กำลังเชื่อมต่อ: [${bar}] ${percent}% (${current}/${total})`));
}

// จัดการเชื่อมต่อ WebSocket
function connectUser(userId) {
  return new Promise((resolve) => {
    const user = createMockUser(userId);
    const startConnectTime = performance.now();
    
    try {
      const socket = io(SOCKET_URL, {
        transports: ['websocket'],
        forceNew: true,
        reconnection: true,
        timeout: 5000
      });
      
      // เก็บ reference ไว้สำหรับเคลียร์ทีหลัง
      connections.push(socket);
      
      socket.on('connect', () => {
        const connectTime = performance.now() - startConnectTime;
        stats.latency.push(connectTime);
        stats.connectSuccess++;
        
        // แจ้งเซิร์ฟเวอร์ว่าผู้ใช้ออนไลน์
        socket.emit('user-online', user);
        stats.messagesSent++;
        
        // เพิ่ม event counters
        ['update-users', 'user-online', 'user-offline'].forEach(event => {
          if (!socketEvents[event]) socketEvents[event] = 0;
          
          socket.on(event, (data) => {
            socketEvents[event]++;
            stats.messagesReceived++;
            
            // ทดสอบ ping/pong เพื่อวัด latency
            if (Math.random() < 0.1) { // 10% chance
              const pingStart = performance.now();
              socket.emit('user-ping', user);
              stats.messagesSent++;
              setTimeout(() => {
                stats.latency.push(performance.now() - pingStart);
              }, 50);
            }
          });
        });
        
        // จำลองการสื่อสาร
        simulateCommunication(socket, user);
        
        resolve(true);
      });
      
      socket.on('connect_error', (err) => {
        stats.connectFail++;
        stats.errors.push(`Connect Error (User ${userId}): ${err.message}`);
        console.log(chalk.red(`\n❌ เชื่อมต่อไม่สำเร็จสำหรับ User ${userId}: ${err.message}`));
        resolve(false);
      });
      
      socket.on('error', (err) => {
        stats.errors.push(`Socket Error (User ${userId}): ${err.message}`);
        console.log(chalk.red(`\n⚠️ เกิดข้อผิดพลาด Socket สำหรับ User ${userId}: ${err.message}`));
      });
      
    } catch (err) {
      stats.connectFail++;
      stats.errors.push(`Exception (User ${userId}): ${err.message}`);
      console.log(chalk.red(`\n💥 เกิดข้อผิดพลาดร้ายแรงสำหรับ User ${userId}: ${err.message}`));
      resolve(false);
    }
  });
}

// จำลองการส่งข้อความหรือทำกิจกรรมต่างๆ
function simulateCommunication(socket, user) {
  // สร้างช่วงเวลาที่สุ่ม ระหว่าง 5-15 วินาที
  const interval = 5000 + Math.floor(Math.random() * 10000);
  
  const timer = setInterval(() => {
    // สุ่มกิจกรรมที่จะทำ
    const action = Math.floor(Math.random() * 3);
    
    switch (action) {
      case 0: // ส่ง ping
        socket.emit('user-ping', user);
        stats.messagesSent++;
        break;
        
      case 1: // สลับสถานะ online/offline
        if (Math.random() > 0.5) {
          socket.emit('user-offline', { email: user.email });
          stats.messagesSent++;
          
          // กลับมาออนไลน์หลังจาก 3-8 วินาที
          setTimeout(() => {
            socket.emit('user-online', user);
            stats.messagesSent++;
          }, 3000 + Math.floor(Math.random() * 5000));
        }
        break;
        
      case 2: // ไม่ทำอะไร - เพื่อจำลองช่วงเวลาเงียบ
        break;
    }
  }, interval);
  
  // เก็บ reference ไว้สำหรับเคลียร์ทีหลัง
  socket._timer = timer;
}

// ฟังก์ชันหลักสำหรับการรัน test suite
async function runTestSuite() {
  console.log(chalk.green('🚀 เริ่มทดสอบการเชื่อมต่อผู้ใช้จำลอง...'));
  
  // เชื่อมต่อผู้ใช้ทีละคนด้วยความล่าช้าที่กำหนด
  for (let i = 1; i <= userCount; i++) {
    printProgressBar(i, userCount);
    await connectUser(i);
    
    if (i < userCount) {
      await new Promise(resolve => setTimeout(resolve, connectionDelay));
    }
  }
  
  console.log(chalk.green('\n\n✅ การเชื่อมต่อเสร็จสมบูรณ์'));
  console.log(chalk.yellow('🧪 กำลังทดสอบพฤติกรรมของระบบในสภาวะปกติ...'));
  
  // รัน load test ตามระยะเวลาที่กำหนด
  setTimeout(() => endTest(), TEST_DURATION);
  
  // แสดงสถิติระหว่างการทดสอบ
  const statsInterval = setInterval(() => {
    const elapsedTime = ((performance.now() - stats.startTime) / 1000).toFixed(1);
    console.log(chalk.cyan(`\n⏱️ เวลาทดสอบ: ${elapsedTime} วินาที`));
    console.log(chalk.cyan(`📨 ข้อความที่รับ: ${stats.messagesReceived}, ข้อความที่ส่ง: ${stats.messagesSent}`));
    logSystemResources();
  }, 5000);
}

// สิ้นสุดการทดสอบและแสดงผลสรุป
function endTest() {
  stats.endTime = performance.now();
  const testDuration = (stats.endTime - stats.startTime) / 1000;
  
  console.log(chalk.blue('\n\n==============================================='));
  console.log(chalk.blue('📊 ผลการทดสอบ WebSocket'));
  console.log(chalk.blue('==============================================='));
  
  console.log(chalk.yellow(`⌛ ระยะเวลาทดสอบ: ${testDuration.toFixed(2)} วินาที`));
  console.log(chalk.yellow(`👥 เชื่อมต่อสำเร็จ: ${stats.connectSuccess}/${userCount} (${((stats.connectSuccess/userCount)*100).toFixed(1)}%)`));
  console.log(chalk.yellow(`📩 ข้อความทั้งหมด: รับ ${stats.messagesReceived}, ส่ง ${stats.messagesSent}`));
  
  // แสดงสถิติ latency
  if (stats.latency.length > 0) {
    const avgLatency = stats.latency.reduce((a, b) => a + b, 0) / stats.latency.length;
    const minLatency = Math.min(...stats.latency);
    const maxLatency = Math.max(...stats.latency);
    
    console.log(chalk.yellow(`⏱️ Latency: เฉลี่ย ${avgLatency.toFixed(2)}ms, ต่ำสุด ${minLatency.toFixed(2)}ms, สูงสุด ${maxLatency.toFixed(2)}ms`));
  }
  
  // แสดงการกระจายตัวของ events
  console.log(chalk.yellow('\n📊 การกระจายของ Events:'));
  Object.keys(socketEvents).forEach(event => {
    console.log(chalk.yellow(`   - ${event}: ${socketEvents[event]} ครั้ง`));
  });
  
  // แสดงรายการข้อผิดพลาด
  if (stats.errors.length > 0) {
    console.log(chalk.red('\n❌ ข้อผิดพลาดที่พบ:'));
    stats.errors.forEach((err, i) => {
      if (i < 10 || stats.errors.length < 20) {
        console.log(chalk.red(`   - ${err}`));
      } else if (i === 10 && stats.errors.length >= 20) {
        console.log(chalk.red(`   ... และอีก ${stats.errors.length - 10} ข้อผิดพลาด`));
      }
    });
  }
  
  console.log(chalk.blue('\n==============================================='));
  console.log(chalk.blue('🏁 การทดสอบเสร็จสิ้น'));
  console.log(chalk.blue('===============================================\n'));
  
  // เคลียร์ทรัพยากร
  connections.forEach(socket => {
    clearInterval(socket._timer);
    socket.disconnect();
  });
  
  process.exit(0);
}

// เริ่มทดสอบ
runTestSuite();
