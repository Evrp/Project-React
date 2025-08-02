// src/context/SocketContext.js
import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

// สร้าง socket instance
const socket = io(import.meta.env.VITE_APP_API_BASE_URL);

export const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState({});
  const userEmail = localStorage.getItem("userEmail");
  const displayName = localStorage.getItem("userName");
  const photoURL = localStorage.getItem("userPhoto");
  
  useEffect(() => {
    if (!userEmail) return;

    // เมื่อโหลดแอป ส่งข้อมูลว่าผู้ใช้ออนไลน์
    socket.emit("user-online", { displayName, photoURL, email: userEmail });

    // ตั้งค่า ping เพื่อบอกเซิร์ฟเวอร์ว่าผู้ใช้ยังออนไลน์อยู่ ทุก 30 วินาที
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("user-ping", { email: userEmail });
      }
    }, 30000);

    // รับข้อมูลการอัปเดตสถานะผู้ใช้จากเซิร์ฟเวอร์
    socket.on("update-users", (data) => {
      if (Array.isArray(data)) {
        const updatedUsers = {};
        data.forEach(user => {
          if (user && user.email) {
            updatedUsers[user.email] = {
              online: true,
              lastActive: Date.now(),
              ...user
            };
          }
        });
        setOnlineUsers(updatedUsers);
      } else if (data && Array.isArray(data.onlineUsers)) {
        const updatedUsers = { ...onlineUsers };
        data.onlineUsers.forEach(email => {
          if (email) {
            updatedUsers[email] = {
              ...updatedUsers[email],
              online: true,
              lastActive: Date.now()
            };
          }
        });
        
        // อัปเดต lastSeenTimes
        if (data.lastSeenTimes) {
          Object.entries(data.lastSeenTimes).forEach(([email, time]) => {
            if (updatedUsers[email] && !updatedUsers[email].online) {
              updatedUsers[email] = {
                ...updatedUsers[email],
                lastActive: time
              };
            }
          });
        }
        
        setOnlineUsers(updatedUsers);
      }
    });

    // ฟังเมื่อมีผู้ใช้ออฟไลน์
    socket.on("user-offline", (userData) => {
      if (userData && userData.email) {
        setOnlineUsers(prev => ({
          ...prev,
          [userData.email]: {
            ...prev[userData.email],
            online: false,
            lastActive: userData.lastSeen || Date.now()
          }
        }));
      }
    });

    // ฟังเมื่อมีผู้ใช้ออนไลน์
    socket.on("user-online", (userData) => {
      if (userData && userData.email) {
        setOnlineUsers(prev => ({
          ...prev,
          [userData.email]: {
            ...prev[userData.email],
            online: true,
            lastActive: Date.now()
          }
        }));
      }
    });

    // เมื่อเชื่อมต่อกับเซิร์ฟเวอร์ใหม่ (reconnect)
    socket.on("connect", () => {
      // แจ้งเซิร์ฟเวอร์ว่าผู้ใช้กลับมาออนไลน์
      socket.emit("user-online", { displayName, photoURL, email: userEmail });
    });

    // cleanup function จะทำงานเมื่อ component ถูก unmount
    // ซึ่งในกรณีนี้คือเมื่อปิดแอป ไม่ใช่เมื่อเปลี่ยนหน้า
    const handleBeforeUnload = () => {
      socket.emit("user-offline", { email: userEmail });
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(pingInterval);
    };
  }, [userEmail, displayName, photoURL]);

  // ส่ง socket และ onlineUsers ให้กับ components ลูก
  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
