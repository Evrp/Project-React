/**
 * WebSocket Visual Monitor
 * 
 * โปรแกรมสำหรับเฝ้าดูและแสดงผลการทำงานของ WebSocket แบบ Real-time ด้วย CLI
 * ใช้สำหรับตรวจสอบสถานะการเชื่อมต่อ การรับส่งข้อมูล และ latency
 * 
 * วิธีใช้: node websocket-visual-monitor.js
 */

import { io } from 'socket.io-client';
import blessed from 'blessed'; // npm install blessed
import chalk from 'chalk';     // npm install chalk
import { performance } from 'perf_hooks';

// Configuration
const SOCKET_URL = process.env.VITE_APP_API_BASE_URL || 'http://localhost:8080';
const UPDATE_INTERVAL = 500; // อัพเดททุก 500ms
const TEST_USERS = 3;        // จำนวน users ทดสอบ

// สร้าง dashboard UI
const screen = blessed.screen({
  smartCSR: true,
  title: 'WebSocket Monitor Dashboard'
});

// สร้าง layout หลัก
const layout = blessed.layout({
  parent: screen,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
});

// Header
const header = blessed.box({
  parent: layout,
  top: 0,
  left: 0,
  width: '100%',
  height: '10%',
  content: '{center}{bold}WebSocket Live Monitor{/bold}{/center}',
  tags: true,
  style: {
    fg: 'white',
    bg: 'blue',
  }
});

// Connection Status
const connectionStatus = blessed.box({
  parent: layout,
  top: '10%',
  left: 0,
  width: '50%',
  height: '20%',
  label: ' Connection Status ',
  content: 'Initializing...',
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: 'white'
    }
  }
});

// Stats
const statsBox = blessed.box({
  parent: layout,
  top: '10%',
  left: '50%',
  width: '50%',
  height: '20%',
  label: ' Stats ',
  content: 'Collecting data...',
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: 'white'
    }
  }
});

// Event Log
const eventLog = blessed.log({
  parent: layout,
  top: '30%',
  left: 0,
  width: '100%',
  height: '40%',
  label: ' Event Log ',
  scrollable: true,
  alwaysScroll: true,
  scrollbar: {
    ch: ' ',
    style: {
      bg: 'yellow'
    }
  },
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: 'white'
    }
  }
});

// User Status
const userStatus = blessed.box({
  parent: layout,
  top: '70%',
  left: 0,
  width: '100%',
  height: '30%',
  label: ' User Status ',
  content: 'No users connected',
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: 'white'
    }
  }
});

// เตรียมข้อมูลสถิติ
const stats = {
  startTime: Date.now(),
  messagesReceived: 0,
  messagesSent: 0,
  errors: 0,
  latency: []
};

// เตรียมข้อมูลผู้ใช้
const users = [];
const sockets = [];

// เมื่อกด ESC หรือ q ให้ออกจากโปรแกรม
screen.key(['escape', 'q', 'C-c'], function() {
  cleanup();
  return process.exit(0);
});

// เมื่อกด r ให้ reset สถิติ
screen.key(['r'], function() {
  stats.startTime = Date.now();
  stats.messagesReceived = 0;
  stats.messagesSent = 0;
  stats.errors = 0;
  stats.latency = [];
  eventLog.log('{yellow-fg}Stats reset!{/yellow-fg}');
  updateStats();
});

// สร้างข้อมูลผู้ใช้จำลอง
function createMockUser(id) {
  return {
    email: `monitor${id}@example.com`,
    displayName: `Monitor User ${id}`,
    photoURL: `https://randomuser.me/api/portraits/lego/${id}.jpg`
  };
}

// อัพเดท UI สถานะการเชื่อมต่อ
function updateConnectionStatus() {
  const activeConnections = sockets.filter(s => s.connected).length;
  let content = '';
  
  if (activeConnections === TEST_USERS) {
    content = `{green-fg}✓ Connected{/green-fg} (${activeConnections}/${TEST_USERS})\n`;
  } else if (activeConnections > 0) {
    content = `{yellow-fg}⚠ Partially Connected{/yellow-fg} (${activeConnections}/${TEST_USERS})\n`;
  } else {
    content = `{red-fg}✗ Disconnected{/red-fg} (0/${TEST_USERS})\n`;
  }
  
  content += `\nServer: ${SOCKET_URL}\n`;
  content += `Uptime: ${formatDuration(Date.now() - stats.startTime)}`;
  
  connectionStatus.setContent(content);
  screen.render();
}

// อัพเดท UI สถิติ
function updateStats() {
  let avgLatency = 0;
  let maxLatency = 0;
  
  if (stats.latency.length > 0) {
    avgLatency = stats.latency.reduce((a, b) => a + b, 0) / stats.latency.length;
    maxLatency = Math.max(...stats.latency);
  }
  
  const content = `Messages Received: ${stats.messagesReceived}\n` +
                 `Messages Sent: ${stats.messagesSent}\n` +
                 `Errors: ${stats.errors}\n` +
                 `Avg Latency: ${avgLatency.toFixed(2)}ms\n` +
                 `Max Latency: ${maxLatency.toFixed(2)}ms`;
  
  statsBox.setContent(content);
  screen.render();
}

// อัพเดท UI สถานะผู้ใช้
function updateUserStatus() {
  if (users.length === 0) {
    userStatus.setContent('No users connected');
    return;
  }
  
  let content = '';
  users.forEach((user, i) => {
    const socket = sockets[i];
    const status = socket.connected ? '{green-fg}Online{/green-fg}' : '{red-fg}Offline{/red-fg}';
    content += `${user.displayName} (${user.email}): ${status}\n`;
  });
  
  userStatus.setContent(content);
  screen.render();
}

// เชื่อมต่อ socket ใหม่
function connectUser(userId) {
  const user = createMockUser(userId);
  users.push(user);
  
  const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    forceNew: true,
    reconnection: true,
    timeout: 5000
  });
  
  sockets.push(socket);
  
  // เมื่อเชื่อมต่อสำเร็จ
  socket.on('connect', () => {
    eventLog.log(`{green-fg}[${user.email}] Connected (ID: ${socket.id}){/green-fg}`);
    socket.emit('user-online', user);
    stats.messagesSent++;
    updateConnectionStatus();
    updateUserStatus();
    updateStats();
  });
  
  // เมื่อตัดการเชื่อมต่อ
  socket.on('disconnect', (reason) => {
    eventLog.log(`{red-fg}[${user.email}] Disconnected: ${reason}{/red-fg}`);
    updateConnectionStatus();
    updateUserStatus();
  });
  
  // เมื่อมีข้อผิดพลาดในการเชื่อมต่อ
  socket.on('connect_error', (err) => {
    eventLog.log(`{red-fg}[${user.email}] Connection Error: ${err.message}{/red-fg}`);
    stats.errors++;
    updateStats();
  });
  
  // รับ events
  ['update-users', 'user-online', 'user-offline'].forEach(event => {
    socket.on(event, (data) => {
      const timestamp = new Date().toLocaleTimeString();
      eventLog.log(`{cyan-fg}[${timestamp}] ${event} from server{/cyan-fg}`);
      stats.messagesReceived++;
      
      // ถ้าเป็น user-online หรือ user-offline ให้แสดงข้อมูลผู้ใช้
      if ((event === 'user-online' || event === 'user-offline') && data.email) {
        eventLog.log(`  → User: ${data.email} (${event === 'user-online' ? 'Online' : 'Offline'})`);
      }
      // ถ้าเป็น update-users ให้แสดงจำนวนผู้ใช้ออนไลน์
      else if (event === 'update-users') {
        try {
          let onlineCount = Array.isArray(data) 
            ? data.length 
            : Array.isArray(data.onlineUsers) 
              ? data.onlineUsers.length 
              : 'unknown';
          eventLog.log(`  → Online users: ${onlineCount}`);
        } catch (err) {
          eventLog.log(`  → Error parsing data: ${err.message}`);
        }
      }
      
      updateStats();
    });
  });
  
  return socket;
}

// สำหรับทดสอบ latency
function testLatency(socket, user) {
  const startTime = performance.now();
  socket.emit('user-ping', user);
  stats.messagesSent++;
  
  // เนื่องจาก user-ping อาจไม่มี callback
  // เราจะวัด latency โดยประมาณจากเวลาที่ได้รับ event ถัดไป
  const latencyTimeout = setTimeout(() => {
    // ถ้าไม่ได้รับการตอบกลับภายใน 2 วินาที ให้บันทึกค่าสูง
    stats.latency.push(2000);
    updateStats();
  }, 2000);
  
  const originalOnMessage = socket.onmessage;
  socket.onAny((event) => {
    // เมื่อได้รับ event ใดๆ หลังจากส่ง ping
    clearTimeout(latencyTimeout);
    stats.latency.push(performance.now() - startTime);
    updateStats();
    
    // คืนค่าฟังก์ชัน onmessage เดิม
    socket.onmessage = originalOnMessage;
  });
}

// จำลองกิจกรรมของผู้ใช้
function simulateUserActivity() {
  sockets.forEach((socket, i) => {
    if (!socket.connected) return;
    
    const user = users[i];
    const randomAction = Math.floor(Math.random() * 10);
    
    switch (randomAction) {
      case 0: // ทดสอบ latency
        testLatency(socket, user);
        break;
        
      case 1: // สลับสถานะออนไลน์/ออฟไลน์
        socket.emit('user-offline', { email: user.email });
        stats.messagesSent++;
        updateStats();
        
        // กลับมาออนไลน์หลังจาก 3 วินาที
        setTimeout(() => {
          socket.emit('user-online', user);
          stats.messagesSent++;
          updateStats();
        }, 3000);
        break;
        
      // สามารถเพิ่มกิจกรรมอื่นๆ ได้ตามต้องการ
    }
  });
}

// ช่วยฟอร์แมตระยะเวลา
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
}

// เคลียร์ทรัพยากรก่อนออกจากโปรแกรม
function cleanup() {
  sockets.forEach(socket => {
    if (socket.connected) {
      socket.disconnect();
    }
  });
}

// เริ่มโปรแกรม
function startMonitor() {
  // แสดงข้อความต้อนรับ
  eventLog.log('{bold}Starting WebSocket Monitor...{/bold}');
  eventLog.log(`{yellow-fg}Connecting to ${SOCKET_URL}{/yellow-fg}`);
  
  // เชื่อมต่อผู้ใช้จำลอง
  for (let i = 1; i <= TEST_USERS; i++) {
    connectUser(i);
  }
  
  // อัพเดทสถานะต่างๆ ทุก interval
  setInterval(() => {
    updateConnectionStatus();
    updateUserStatus();
  }, UPDATE_INTERVAL);
  
  // จำลองกิจกรรมผู้ใช้ทุก 5 วินาที
  setInterval(() => {
    simulateUserActivity();
  }, 5000);
  
  // แสดงผล
  screen.render();
}

// เริ่มโปรแกรม
startMonitor();
