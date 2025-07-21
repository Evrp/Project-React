import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./friend.css";
import "./OnlineStatus.css";

// ใส่ styles สำหรับ notifications
const notificationStyles = `
  .friend-request-toast {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .toast-profile-img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .toast-content {
    font-size: 14px;
  }
  
  .friend-header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 16px;
  }

  .profile-section-home {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .notification-container {
    position: relative;
  }

  .bell-btn-home {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
  }

  .bell-icon-home {
    position: relative;
  }

  .notifications-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #ff4d4f;
    color: white;
    border-radius: 10px;
    padding: 0 6px;
    font-size: 12px;
    min-width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .divider-home {
    color: #d9d9d9;
    font-size: 20px;
  }

  .profile-img-wrapper-home {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
  }

  .profile-image-home {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .notification-dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 5px);
    background-color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 12px;
    width: 320px;
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  }

  .notification-dropdown h3 {
    margin: 0 0 10px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
    font-size: 16px;
    color: #333;
  }

  .notification-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .notification-item {
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 8px;
    transition: background-color 0.2s;
  }

  .notification-item.unread {
    background-color: #f0f7ff;
    border-left: 3px solid #4a89dc;
  }

  .notification-item.read {
    background-color: #f9f9f9;
    opacity: 0.8;
  }
  
  .notification-content {
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .notification-content:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
  
  @keyframes readNotification {
    0% { background-color: #f0f7ff; }
    100% { background-color: #f9f9f9; }
  }
  
  .notification-item.just-read {
    animation: readNotification 1s forwards;
  }
  
  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .notification-stats {
    flex: 1;
  }
  
  .clear-read-button {
    background-color: transparent;
    border: 1px solid #ddd;
    padding: 5px 10px;
    border-radius: 4px;
    color: #666;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
  }
  
  .clear-read-button:hover {
    background-color: #f5f5f5;
    color: #333;
  }
  
  .dark-mode .clear-read-button {
    border-color: #444;
    color: #aaa;
  }
  
  .dark-mode .clear-read-button:hover {
    background-color: #333;
    color: #eee;
  }

  .notification-content {
    display: flex;
    gap: 10px;
  }

  .notification-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .notification-details {
    flex-grow: 1;
  }

  .notification-details p {
    margin: 0 0 5px 0;
    font-size: 14px;
  }

  .notification-time {
    font-size: 12px;
    color: #999;
  }

  .notification-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .no-notifications {
    text-align: center;
    color: #999;
    padding: 20px 0;
  }
  
  .new-friend-request-alert {
    background-color: #f0f8ff;
    border: 1px solid #d9e8f6;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
    animation: fadeIn 0.5s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .friend-request-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }
  
  .accept-btn {
    background-color: #52c41a;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 4px 12px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .accept-btn:hover {
    background-color: #389e0d;
  }
  
  .decline-btn {
    background-color: #f5f5f5;
    color: #555;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 4px 12px;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .decline-btn:hover {
    background-color: #f0f0f0;
    color: #333;
  }

  /* Dark mode support */
  .dark-mode .notification-dropdown {
    background-color: #1f1f1f;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .dark-mode .notification-dropdown h3 {
    color: #ddd;
    border-bottom-color: #333;
  }

  .dark-mode .notification-item.unread {
    background-color: #0a2647;
  }

  .dark-mode .notification-item.read {
    background-color: #2a2a2a;
  }

  .dark-mode .notification-time {
    color: #999;
  }

  .dark-mode .no-notifications {
    color: #999;
  }
`;
import { IoMdPersonAdd } from "react-icons/io";
import RequireLogin from "../ui/RequireLogin";
import { BsThreeDots } from "react-icons/bs";
import { useTheme } from "../../context/themecontext";
import { useParams } from "react-router-dom";

// สร้าง socket instance พร้อม options เพื่อแก้ปัญหาการเชื่อมต่อ
const socket = io(import.meta.env.VITE_APP_API_BASE_URL, {
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ["websocket", "polling"], // ระบุ transport ที่จะใช้
  autoConnect: true, // เชื่อมต่ออัตโนมัติเมื่อสร้าง instance
  forceNew: false,
  query: { clientId: 'friend-component-' + Date.now() } // เพิ่ม query parameter เพื่อระบุตัวตน
});

// แสดงข้อมูลสถานะการเชื่อมต่อ socket อย่างละเอียด
socket.on("connect", () => {
  console.log("😀 Socket connected successfully:", socket.id);
  console.log(
    "Socket status:",
    socket.connected ? "Connected" : "Disconnected"
  );
  console.log("Socket connected to URL:", import.meta.env.VITE_APP_API_BASE_URL);
  
  // แสดงข้อมูลเพิ่มเติมเพื่อการตรวจสอบ
  console.log("Socket transport used:", socket.io.engine.transport.name);
});

socket.on("connect_error", (err) => {
  console.error("😡 Socket connection error:", err);
  console.error("Error connecting to:", import.meta.env.VITE_APP_API_BASE_URL);
  // ลองเชื่อมต่อใหม่อัตโนมัติ
  setTimeout(() => {
    console.log("🔄 Attempting to reconnect socket...");
    socket.connect();
  }, 2000);
});

socket.on("disconnect", (reason) => {
  console.log("😥 Socket disconnected:", reason);
  if (reason === "io server disconnect") {
    // ถ้าเซิร์ฟเวอร์ตัดการเชื่อมต่อ ลองเชื่อมต่อใหม่
    console.log("🔄 Server disconnected, attempting to reconnect...");
    socket.connect();
  }
});

// ตรวจสอบว่า socket เชื่อมต่ออยู่หรือไม่
if (!socket.connected) {
  console.log("Socket not connected, attempting to connect...");
  socket.connect();
}

// ฟังก์ชันเพื่อจัดการกับเวลาที่แสดง last seen
const formatLastSeen = (timestamp) => {
  if (!timestamp) return "ไม่มีข้อมูล";

  const now = new Date();
  const lastSeen = new Date(timestamp);
  const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));

  if (diffInMinutes < 1) return "เมื่อสักครู่";
  if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;

  return lastSeen.toLocaleDateString();
};

const Friend = () => {
  // รับ roomId จาก URL ถ้ามี เช่น /friend/:roomId
  const { roomId } = useParams();

  // ย้ายตัวแปรเหล่านี้มาอยู่ด้านบนก่อนการใช้งานใน useEffect
  const userEmail = localStorage.getItem("userEmail");
  const displayName = localStorage.getItem("userName");
  const photoURL = localStorage.getItem("userPhoto");

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState([]);
  const [currentUserfollow, setCurrentUserfollow] = useState(null);
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingFriendEmail, setLoadingFriendEmail] = useState(null);
  const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);
  const [loading, setLoading] = useState(false); // loading รวม
  const modalRef = useRef(null);
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [getnickName, getNickName] = useState("");
  const dropdownRefs = useRef({});
  const { isDarkMode } = useTheme();
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [newFriendRequest, setNewFriendRequest] = useState(null);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);

  // โหลดการแจ้งเตือนจาก localStorage เมื่อเริ่มต้น
  useEffect(() => {
    if (userEmail) {
      const savedNotifications = localStorage.getItem(`notifications_${userEmail}`);
      if (savedNotifications) {
        try {
          const parsedNotifications = JSON.parse(savedNotifications);
          console.log("โหลดการแจ้งเตือนจาก localStorage:", parsedNotifications);
          setNotifications(parsedNotifications);
        } catch (error) {
          console.error("เกิดข้อผิดพลาดในการแปลงข้อมูลแจ้งเตือนจาก localStorage:", error);
        }
      }
    }
  }, [userEmail]);

  // บันทึกการแจ้งเตือนลงใน localStorage ทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    if (userEmail && notifications.length > 0) {
      localStorage.setItem(`notifications_${userEmail}`, JSON.stringify(notifications));
      console.log("บันทึกการแจ้งเตือนลงใน localStorage:", notifications);
    }
  }, [notifications, userEmail]);

  // ตรวจสอบว่ามีคำขอเพื่อนที่ยังไม่อ่านอยู่หรือไม่ เพื่อแสดงการแจ้งเตือน
  useEffect(() => {
    if (userEmail && notifications.length > 0) {
      // ค้นหาคำขอเพื่อนที่ยังไม่ได้อ่าน
      const unreadFriendRequest = notifications.find(
        (n) => n.type === "friend-request" && !n.read
      );

      // ถ้ามีคำขอเพื่อนที่ยังไม่ได้อ่าน ให้แสดงใน newFriendRequest
      if (unreadFriendRequest && !newFriendRequest) {
        setNewFriendRequest({
          ...unreadFriendRequest,
          id: unreadFriendRequest.id,
        });
        console.log("แสดงคำขอเพื่อนที่ยังไม่ได้อ่าน:", unreadFriendRequest);
      }
    }
  }, [notifications, newFriendRequest, userEmail]);

  // ทดสอบเพิ่มข้อมูลแจ้งเตือนจำลอง (สำหรับการทดสอบเท่านั้น)
  // useEffect(() => {
  //   if (userEmail) {
  //     // สร้างข้อมูลจำลองเพื่อทดสอบการแสดงผล
  //     const testNotification = {
  //       id: Date.now(),
  //       type: "friend-request",
  //       from: {
  //         email: "test@example.com",
  //         displayName: "ผู้ใช้ทดสอบ",
  //         photoURL: "https://via.placeholder.com/40"
  //       },
  //       timestamp: new Date().toISOString(),
  //       read: false
  //     };

  //     // ตั้งเวลาเพิ่มข้อมูลทดสอบหลังจากโหลดหน้า 3 วินาที
  //     const timer = setTimeout(() => {
  //       console.log("กำลังเพิ่มข้อมูลแจ้งเตือนทดสอบ:", testNotification);
  //       setNotifications(prev => [testNotification, ...prev]);

  //       // ทดสอบการแสดง newFriendRequest
  //       setNewFriendRequest({
  //         ...testNotification,
  //         id: testNotification.id
  //       });
  //     }, 3000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [userEmail]);

  useEffect(() => {
    fetchGmailUser();
  }, []);

  const fetchCurrentUserAndFriends = async () => {
    setLoading(true);
    setError("");
    try {
      const encodedEmail = encodeURIComponent(userEmail);
      const userRes = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/users/${encodedEmail}`
      );
      const currentUser = userRes.data;
      const allUsersRes = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/users`
      );
      const allUsers = allUsersRes.data;
      setUsers(allUsers);
      if (Array.isArray(currentUser.friends)) {
        // ดึง email จาก friends array (object)
        const friendEmails = currentUser.friends.map((f) => f.email);
        const filteredFriends = allUsers
          .filter((user) => friendEmails.includes(user.email))
          .map((user) => ({
            photoURL: user.photoURL,
            email: user.email,
            displayName: user.displayName,
            isOnline: user.isOnline || false,
          }))
          .sort((a, b) => a.displayName.localeCompare(b.displayName));
        setFriends(filteredFriends);
      } else {
        setFriends([]);
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูลเพื่อน");
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลเพื่อน");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!userEmail) return;
    fetchCurrentUserAndFriends();

    // แจ้งสถานะออนไลน์เมื่อเริ่มต้น
    socket.emit("user-online", {
      displayName,
      photoURL,
      email: userEmail,
    });

    // ลองเช็คการเชื่อมต่อของ socket ทุกๆ 10 วินาที
    const socketCheckInterval = setInterval(() => {
      if (!socket.connected) {
        console.warn("⚠️ Socket ไม่ได้เชื่อมต่อ! กำลังลองเชื่อมต่อใหม่...");
        socket.connect();
      } else {
        console.log("✓ Socket ยังคงเชื่อมต่ออยู่:", socket.id);
      }
    }, 10000);
    
    // ฟังการแจ้งเตือนเมื่อมีคนส่งคำขอเพื่อนใหม่
    socket.on("notify-friend-request", async () => {
      console.log("📩 ได้รับแจ้งเตือนมีคำขอเป็นเพื่อนใหม่");
      
      try {
        // ดึงข้อมูลคำขอเพื่อนล่าสุดผ่าน REST API
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/api/friend-requests/${userEmail}`
        );
        
        // ถ้าไม่มีคำขอเพื่อนใหม่
        if (!response.data || !response.data.requests || response.data.requests.length === 0) {
          console.log("ไม่พบคำขอเพื่อนใหม่จาก API");
          return;
        }
        
        // หาคำขอเพื่อนล่าสุด
        const latestRequest = response.data.requests[0];
        console.log("คำขอเพื่อนล่าสุดจาก API:", latestRequest);
        
        // สร้าง ID สำหรับคำขอ (ใช้ ID จาก API ถ้ามี หรือสร้างใหม่)
        const requestId = latestRequest.requestId || Date.now();
        
        // เซ็ตข้อมูลคำขอใหม่พร้อม ID
        setNewFriendRequest({
          from: latestRequest.from,
          to: latestRequest.to,
          timestamp: latestRequest.timestamp,
          id: requestId,
        });
        
        // อัพเดตการแจ้งเตือนใน state
        setNotifications(prevNotifications => {
          const newNotification = {
            id: requestId,
            type: "friend-request",
            from: latestRequest.from,
            timestamp: latestRequest.timestamp,
            read: false
          };
          
          // กรองคำขอเพื่อนที่ซ้ำกันออกไป
          const filteredNotifications = prevNotifications.filter(n => 
            n.type !== "friend-request" || 
            (n.type === "friend-request" && n.from.email !== latestRequest.from.email)
          );
          
          // สร้างรายการแจ้งเตือนใหม่
          return [newNotification, ...filteredNotifications];
        });
        
        console.log("💾 การแจ้งเตือนจะถูกบันทึกลงใน localStorage โดยอัตโนมัติผ่าน useEffect");
        
        // แสดง toast notification
        toast.info(
          <div className="friend-request-toast">
            <img
              src={latestRequest.from.photoURL}
              alt={latestRequest.from.displayName}
              className="toast-profile-img"
            />
            <div className="toast-content">
              <strong>{latestRequest.from.displayName}</strong>{" "}
              ได้ส่งคำขอเป็นเพื่อนถึงคุณ
            </div>
          </div>,
          {
            autoClose: 8000,
            position: "bottom-right",
          }
        );
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลคำขอเพื่อน:", error);
      }
    });

    // ฟังการแจ้งเตือนเมื่อมีคนยอมรับคำขอเป็นเพื่อน
    socket.on("notify-friend-accept", async () => {
      try {
        // ดึงข้อมูลเพื่อนล่าสุด
        await fetchCurrentUserAndFriends();
        
        // ต้องดึงข้อมูลจาก API เพื่อดูว่าใครยอมรับคำขอเพื่อนเรา
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/api/friend-accepts/${userEmail}`
        );
        
        if (response.data && response.data.latestAccept) {
          const acceptInfo = response.data.latestAccept;
          
          // แสดง toast notification
          toast.success(
            <div className="friend-request-toast">
              <img
                src={acceptInfo.photoURL}
                alt={acceptInfo.displayName}
                className="toast-profile-img"
              />
              <div className="toast-content">
                <strong>{acceptInfo.displayName}</strong>{" "}
                ได้ตอบรับคำขอเป็นเพื่อนของคุณแล้ว
              </div>
            </div>,
            {
              autoClose: 5000,
              position: "bottom-right",
            }
          );
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลการยอมรับคำขอเพื่อน:", error);
      }
    });

    // ฟังสถานะอัปเดตผู้ใช้ออนไลน์ (ยังคงใช้ WebSocket สำหรับข้อมูลแบบ real-time)
    socket.on("update-users", (data) => {
      // เช็คว่า data เป็น array หรือ object
      console.log("ข้อมูลที่ได้จาก update-users:", data);

      // ถ้าข้อมูลเป็น array ใช้ตามเดิม
      if (Array.isArray(data)) {
        setUsers((prevUsers) =>
          prevUsers.map((user) => ({
            ...user,
            isOnline: data.some(
              (onlineUser) => onlineUser.email === user.email
            ),
            lastSeen:
              data.find((onlineUser) => onlineUser.email === user.email)
                ?.lastSeen || user.lastSeen,
          }))
        );
        setFriends((prevFriends) =>
          prevFriends.map((friend) => ({
            ...friend,
            isOnline: data.some(
              (onlineUser) => onlineUser.email === friend.email
            ),
            lastSeen:
              data.find((onlineUser) => onlineUser.email === friend.email)
                ?.lastSeen || friend.lastSeen,
          }))
        );
      }
      // ถ้าข้อมูลเป็น object มี onlineUsers เป็น array
      else if (data && Array.isArray(data.onlineUsers)) {
        setUsers((prevUsers) =>
          prevUsers.map((user) => ({
            ...user,
            isOnline: data.onlineUsers.includes(user.email),
            lastSeen:
              (data.lastSeenTimes && data.lastSeenTimes[user.email]) ||
              user.lastSeen,
          }))
        );
        setFriends((prevFriends) =>
          prevFriends.map((friend) => ({
            ...friend,
            isOnline: data.onlineUsers.includes(friend.email),
            lastSeen:
              (data.lastSeenTimes && data.lastSeenTimes[friend.email]) ||
              friend.lastSeen,
          }))
        );
      }
    });

    // ฟังเมื่อมีผู้ใช้ออฟไลน์
    socket.on("user-offline", (userData) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.email === userData.email
            ? { ...user, isOnline: false, lastSeen: userData.lastSeen }
            : user
        )
      );
      setFriends((prevFriends) =>
        prevFriends.map((friend) =>
          friend.email === userData.email
            ? { ...friend, isOnline: false, lastSeen: userData.lastSeen }
            : friend
        )
      );
    });

    // ฟังเมื่อมีผู้ใช้ออนไลน์
    socket.on("user-online", (userData) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.email === userData.email
            ? { ...user, isOnline: true, lastSeen: null }
            : user
        )
      );
      setFriends((prevFriends) =>
        prevFriends.map((friend) =>
          friend.email === userData.email
            ? { ...friend, isOnline: true, lastSeen: null }
            : friend
        )
      );
    });
    
    // ฟังเมื่อเราถูกลบออกจากรายการเพื่อน
    socket.on("notify-friend-removed", async (data) => {
      if (data.to === userEmail) {
        console.log(`คุณถูกลบออกจากรายการเพื่อนโดย: ${data.from}`);
        
        // ดึงข้อมูลเพื่อนใหม่
        await fetchCurrentUserAndFriends();
        
        // แสดง toast notification
        toast.info(`คุณถูกลบออกจากรายการเพื่อน`, {
          autoClose: 5000,
          position: "bottom-right"
        });
      }
    });

    // ทำความสะอาด event listeners เมื่อ unmount
    return () => {
      socket.emit("user-offline", { email: userEmail });
      clearInterval(socketCheckInterval);
      socket.off("update-users");
      socket.off("user-offline");
      socket.off("user-online");
      socket.off("notify-friend-request");
      socket.off("notify-friend-accept");
      socket.off("notify-friend-removed");
    };
  }, [userEmail]);

  // ฟังก์ชันสำหรับการทำเครื่องหมายว่าแจ้งเตือนได้อ่านแล้ว
  const markNotificationAsRead = (notificationId) => {
    console.log(`📝 ทำเครื่องหมายว่าแจ้งเตือน ${notificationId} ได้อ่านแล้ว`);
    
    // หาอินเด็กซ์ของการแจ้งเตือนที่จะทำเครื่องหมายว่าอ่านแล้ว
    const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
    if (notificationElement) {
      // เพิ่มคลาสสำหรับแอนิเมชันการอ่าน
      notificationElement.classList.add('just-read');
      
      // รอให้แอนิเมชันเสร็จก่อนที่จะอัพเดต state
      setTimeout(() => {
        setNotifications(prevNotifications => {
          const updatedNotifications = prevNotifications.map(notification => {
            if (notification.id === notificationId) {
              return { ...notification, read: true };
            }
            return notification;
          });
          
          console.log(`✅ อัพเดตสถานะการอ่านแจ้งเตือนแล้ว`);
          return updatedNotifications;
        });
      }, 500); // รอครึ่งวินาที
    } else {
      // ถ้าไม่พบ element ให้อัพเดต state ทันที
      setNotifications(prevNotifications => {
        return prevNotifications.map(notification => {
          if (notification.id === notificationId) {
            return { ...notification, read: true };
          }
          return notification;
        });
      });
    }
    
    // ตรวจสอบว่า newFriendRequest ตรงกับ notificationId ที่กำลังทำเครื่องหมาย
    if (newFriendRequest && newFriendRequest.id === notificationId) {
      // รอให้แอนิเมชันเสร็จก่อนที่จะซ่อนการแจ้งเตือน
      setTimeout(() => {
        setNewFriendRequest(null); // ลบการแสดงแจ้งเตือนใหม่ออก
      }, 800);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // ฟังก์ชันสุ่ม roomId (UUID v4 แบบง่าย)
  function generateRoomId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  const handleAddFriend = async (friendEmail) => {
    try {
      setLoadingFriendEmail(friendEmail);
      // ใช้ roomId จาก useParams ถ้ามี ถ้าไม่มีให้ gen ใหม่
      const finalRoomId = roomId || generateRoomId();

      console.log("กำลังส่งคำขอเป็นเพื่อนไปยัง:", friendEmail);
      
      // สร้าง ID สำหรับคำขอเพื่อน
      const requestId = Date.now();
      
      // ข้อมูลคำขอเพื่อน
      const requestData = {
        from: {
          email: userEmail,
          displayName: displayName,
          photoURL: photoURL,
        },
        to: friendEmail,
        timestamp: new Date().toISOString(),
        type: "friend-request",
        requestId: requestId
      };
      
      console.log("ข้อมูลคำขอเพื่อน:", requestData);
      
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/friend-request`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log("ส่งคำขอเพื่อนสำเร็จ:", response.data);
      
      // เราจะยังคงใช้ socket เพื่อแจ้งเตือนแบบ real-time ไปยังผู้ใช้ปลายทาง
      // แต่การจัดการข้อมูลจริงจะทำผ่าน REST API
      if (socket.connected) {
        // แจ้งเตือนแบบ real-time เท่านั้น ไม่มีการจัดการข้อมูล
        socket.emit("notify-friend-request", { to: friendEmail });
      }

      // จากนั้นเพิ่มเพื่อนในฐานข้อมูล
      await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/add-friend`,
        {
          userEmail,
          friendEmail,
          roomId: finalRoomId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const addedUser = users.find((user) => user.email === friendEmail);
      if (addedUser) {
        setFriends((prev) =>
          [
            ...prev,
            {
              photoURL: addedUser.photoURL,
              email: addedUser.email,
              displayName: addedUser.displayName,
              isOnline: addedUser.isOnline || false,
            },
          ].sort((a, b) => a.displayName.localeCompare(b.displayName))
        );
      }

      toast.success("เพิ่มเพื่อนสำเร็จ! กรุณารอการตอบกลับจาก " + friendEmail);
    } catch (error) {
      console.error("ข้อผิดพลาดในการเพิ่มเพื่อน:", error);
      setError("ไม่สามารถเพิ่มเพื่อนได้");
      toast.error("ไม่สามารถเพิ่มเพื่อนได้");
    } finally {
      setLoadingFriendEmail(null);
    }
  };

  const handleRemoveFriend = async (friendEmail) => {
    if (!window.confirm("คุณต้องการลบเพื่อนคนนี้หรือไม่?")) return;
    try {
      setLoadingFriendEmail(friendEmail);
      
      // ลบเพื่อนผ่าน REST API
      await axios.delete(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/api/users/${userEmail}/friends/${friendEmail}`
      );
      
      // อัปเดต UI ทันที
      setFriends((prevFriends) =>
        prevFriends.filter((friend) => friend.email !== friendEmail)
      );
      
      // แจ้งเตือน real-time ให้อีกฝ่ายทราบ (เพื่อให้เขาสามารถอัปเดต UI ได้ทันที)
      if (socket.connected) {
        socket.emit("notify-friend-removed", {
          to: friendEmail,
          from: userEmail
        });
      }
      
      toast.success("ลบเพื่อนสําเร็จ!");
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการลบเพื่อน:", err);
      setError("เกิดข้อผิดพลาดในการลบเพื่อน");
      toast.error("เกิดข้อผิดพลาดในการลบเพื่อน");
    } finally {
      setLoadingFriendEmail(null);
    }
  };

  const isFriend = (email) =>
    Array.isArray(friends) && friends.some((friend) => friend.email === email);

  const handleProfileClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleCloseModal();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchTerm) &&
      user.email !== userEmail
  );

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/users/${userEmail}`
      );
      const userData = {
        ...res.data,
        following: Array.isArray(res.data.following) ? res.data.following : [],
      };
      setCurrentUser(userData);
      setLoadingCurrentUser(false);
    } catch (err) {
      setError("คุณสามารถเพิ่มเพื่อนได้ทันที");
      setCurrentUser(null);
      setLoadingCurrentUser(false);
    }
  };
  const fetchGmailUser = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/users/${userEmail}`
      );
      setCurrentUserfollow(res.data);
    } catch (err) {
      setError("โหลด Gmail currentUser ไม่ได้");
    }
  };

  const handleFollow = async (targetEmail) => {
    await fetchGmailUser();
    if (!currentUserfollow || !Array.isArray(currentUserfollow.following)) {
      toast.error("ข้อมูลผู้ใช้ยังไม่พร้อม");
      return;
    }
    const isFollowing = currentUserfollow.following.includes(targetEmail);
    const url = `${
      import.meta.env.VITE_APP_API_BASE_URL
    }/api/users/${userEmail}/${
      isFollowing ? "unfollow" : "follow"
    }/${targetEmail}`;
    const method = isFollowing ? "DELETE" : "POST";
    try {
      await axios({ method, url });
      await fetchGmailUser();
      toast.success(isFollowing ? "Unfollowed" : "Followed");
    } catch (err) {
      setError("Follow/unfollow error");
      toast.error("Follow/unfollow error");
    }
  };

  // Function to toggle notification dropdown
  const toggleNotificationDropdown = () => {
    setShowNotificationDropdown((prev) => !prev);

    // แสดงข้อมูลการแจ้งเตือนปัจจุบัน
    console.log("ข้อมูลการแจ้งเตือนทั้งหมด:", notifications);
    console.log(
      "การแจ้งเตือนคำขอเพื่อน:",
      notifications.filter((n) => n.type === "friend-request")
    );

    // ไม่ต้องทำเครื่องหมายว่าอ่านแล้วโดยอัตโนมัติสำหรับคำขอเพื่อน
    // เพื่อให้ผู้ใช้สามารถยอมรับหรือปฏิเสธคำขอได้
    // แต่จะทำเครื่องหมายเฉพาะการแจ้งเตือนประเภทอื่น (ถ้ามี)
    if (!showNotificationDropdown) {
      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.type !== "friend-request" ? { ...notif, read: true } : notif
          )
        );
      }, 3000);
    }
  };

  useEffect(() => {
    if (!userEmail) {
      setCurrentUser(null);
      setLoadingCurrentUser(false);
      return;
    }
    fetchCurrentUser();
  }, [userEmail]);

  // Refs for the notification dropdown
  const notificationDropdownRef = useRef(null);
  const bellButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // For normal dropdowns
      const isClickInsideAny = Object.values(dropdownRefs.current).some((ref) =>
        ref?.contains(event.target)
      );
      if (!isClickInsideAny) {
        setOpenMenuFor(null);
      }

      // For notification dropdown
      if (
        showNotificationDropdown &&
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target) &&
        bellButtonRef.current &&
        !bellButtonRef.current.contains(event.target)
      ) {
        setShowNotificationDropdown(false);
      }
    };

    // เพิ่ม event scroll เพื่อปิด dropdown
    const handleScroll = () => {
      setOpenMenuFor(null);
      setShowNotificationDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true); // true เพื่อจับทุก scroll

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [showNotificationDropdown]);

  const filteredFriends = friends.filter((friend) =>
    friend.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // ฟังก์ชันสำหรับล้างการแจ้งเตือนที่อ่านแล้ว
  const clearReadNotifications = () => {
    console.log("🧹 กำลังล้างการแจ้งเตือนที่อ่านแล้ว");
    
    setNotifications(prevNotifications => {
      // กรองเอาเฉพาะการแจ้งเตือนที่ยังไม่ได้อ่าน
      const unreadNotifications = prevNotifications.filter(n => !n.read);
      console.log(`✅ เหลือการแจ้งเตือนที่ยังไม่ได้อ่าน ${unreadNotifications.length} รายการ`);
      return unreadNotifications;
    });
  };
  
  const fetchFollowInfo = async (targetEmail) => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/api/user/${targetEmail}/follow-info`
      );
      setFollowers(res.data.followers);
      setFollowing(res.data.following);
    } catch (error) {
      setError("Error fetching follow info");
    }
  };

  // ฟังก์ชันสำหรับจัดการกับการตอบกลับคำขอเป็นเพื่อน
  const handleFriendRequestResponse = async (requestId, response) => {
    // ทำเครื่องหมายว่าอ่านแล้ว
    markNotificationAsRead(requestId);
    
    // ถ้าตอบรับเป็นเพื่อน
    if (response === "accept") {
      // แจ้งกลับไปยังผู้ส่งคำขอว่าได้ตอบรับแล้ว
      const notification = notifications.find((n) => n.id === requestId);
      if (notification) {
        try {
          // ใช้ roomId จาก useParams ถ้ามี ถ้าไม่มีให้ gen ใหม่
          const finalRoomId = roomId || generateRoomId();

          // ส่งการตอบกลับคำขอเพื่อนผ่าน REST API
          const responseData = await axios.post(
            `${import.meta.env.VITE_APP_API_BASE_URL}/api/friend-request-response`,
            {
              requestId: requestId,
              userEmail: userEmail,
              friendEmail: notification.from.email,
              response: "accept",
              roomId: finalRoomId,
              from: {
                email: userEmail,
                displayName: displayName,
                photoURL: photoURL,
              },
              to: notification.from.email,
              timestamp: new Date().toISOString()
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          console.log("การตอบรับคำขอเพื่อนสำเร็จ:", responseData.data);
          
          // เพิ่มเพื่อนใหม่ในรายการ UI
          const addedUser = users.find(
            (user) => user.email === notification.from.email
          );
          
          if (addedUser) {
            setFriends((prev) =>
              [
                ...prev,
                {
                  photoURL: addedUser.photoURL,
                  email: addedUser.email,
                  displayName: addedUser.displayName,
                  isOnline: addedUser.isOnline || false,
                },
              ].sort((a, b) => a.displayName.localeCompare(b.displayName))
            );
          }

          // ส่งการแจ้งเตือนแบบ real-time ไปยังผู้ใช้ปลายทางเพื่อแสดงผลทันที
          // แต่การอัปเดตข้อมูลจริงอยู่ใน API แล้ว
          if (socket.connected) {
            socket.emit("notify-friend-accept", {
              to: notification.from.email
            });
          }

          // รีเซ็ตคำขอที่กำลังแสดง
          setNewFriendRequest(null);

          toast.success(
            `คุณได้ตอบรับคำขอเป็นเพื่อนจาก ${notification.from.displayName}`
          );
        } catch (error) {
          console.error("เกิดข้อผิดพลาดในการยอมรับคำขอเพื่อน:", error);
          toast.error("ไม่สามารถเพิ่มเพื่อนได้");
        }
      }
    } else if (response === "decline") {
      try {
        // ส่งการปฏิเสธคำขอเพื่อนผ่าน REST API
        const notification = notifications.find((n) => n.id === requestId);
        if (notification) {
          await axios.post(
            `${import.meta.env.VITE_APP_API_BASE_URL}/api/friend-request-response`,
            {
              requestId: requestId,
              userEmail: userEmail,
              friendEmail: notification.from.email,
              response: "decline"
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
        
        // รีเซ็ตคำขอที่กำลังแสดง
        setNewFriendRequest(null);
        
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการปฏิเสธคำขอเพื่อน:", error);
      }
    }
  };
  useEffect(() => {
    const getNickNameF = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/api/get-all-nicknames`
        );
        getNickName(res.data);
      } catch (err) {
        setError("โหลด nickname ล้มเหลว");
      }
    };
    getNickNameF();
  }, []);

  return (
    <RequireLogin>
      <style dangerouslySetInnerHTML={{ __html: notificationStyles }} />
      <div className={`fr-container ${isDarkMode ? "dark-mode" : ""}`}>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        <div className="text-xl-font-semibold">
          <div className="friend-header-container">
            <h1>Friend</h1>

            <div className="profile-section-home">
              <div className="notification-container">
                <button
                  ref={bellButtonRef}
                  className="bell-btn-home"
                  aria-label="Notifications"
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                >
                  <span className="bell-icon-home">&#128276;</span>
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="notifications-badge">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotificationDropdown && (
                  <div
                    className="notification-dropdown"
                    ref={notificationDropdownRef}
                  >
                    <h3>การแจ้งเตือนคำขอเป็นเพื่อน</h3>
                    {console.log("กำลังเรนเดอร์ dropdown:", notifications)}
                    {notifications && notifications.length > 0 ? (
                      <>
                        <div className="notification-header">
                          <div className="notification-stats">
                            <p>จำนวนการแจ้งเตือนทั้งหมด: {notifications.length}</p>
                            <p>
                              การแจ้งเตือนคำขอเพื่อน:{" "}
                              {
                                notifications.filter(
                                  (n) => n.type === "friend-request"
                                ).length
                              }
                            </p>
                          </div>
                          <button 
                            className="clear-read-button"
                            onClick={clearReadNotifications}
                          >
                            ล้างที่อ่านแล้ว
                          </button>
                        </div>
                        <ul className="notification-list">
                          {notifications.map((notif) => (
                            <li
                              key={notif.id}
                              data-notification-id={notif.id}
                              className={`notification-item ${
                                notif.read ? "read" : "unread"
                              }`}
                            >
                              <div className="notification-content" onClick={() => markNotificationAsRead(notif.id)}>
                                <img
                                  src={
                                    notif.from?.photoURL ||
                                    "https://via.placeholder.com/40"
                                  }
                                  alt={notif.from?.displayName || "ผู้ใช้"}
                                  className="notification-avatar"
                                />
                                <div className="notification-details">
                                  <p>
                                    <strong>
                                      {notif.from?.displayName || "ผู้ใช้"}
                                    </strong>{" "}
                                    ส่งคำขอเป็นเพื่อน
                                  </p>
                                  <span className="notification-time">
                                    {new Date(notif.timestamp).toLocaleString(
                                      "th-TH"
                                    )}
                                  </span>
                                  <div className="notification-actions">
                                    <button
                                      className="accept-btn"
                                      onClick={() => {
                                        console.log(
                                          "กำลังยอมรับคำขอเพื่อน ID:",
                                          notif.id
                                        );
                                        handleFriendRequestResponse(
                                          notif.id,
                                          "accept"
                                        );
                                      }}
                                    >
                                      ยอมรับ
                                    </button>
                                    <button
                                      className="decline-btn"
                                      onClick={() => {
                                        console.log(
                                          "กำลังปฏิเสธคำขอเพื่อน ID:",
                                          notif.id
                                        );
                                        handleFriendRequestResponse(
                                          notif.id,
                                          "decline"
                                        );
                                      }}
                                    >
                                      ปฏิเสธ
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="no-notifications">ไม่มีการแจ้งเตือนใหม่</p>
                    )}
                  </div>
                )}
              </div>

              <span className="divider-home">|</span>
              <div className="profile-img-wrapper-home">
                <img
                  src={photoURL}
                  alt="Profile"
                  className="profile-image-home"
                />
              </div>
            </div>
          </div>

          {/* แสดงการแจ้งเตือนคำขอเป็นเพื่อนใหม่ */}
          {newFriendRequest && (
            <div className="new-friend-request-alert">
              <div className="friend-request-toast">
                <img
                  src={newFriendRequest.from.photoURL}
                  alt={newFriendRequest.from.displayName}
                  className="toast-profile-img"
                />
                <div className="toast-content">
                  <strong>{newFriendRequest.from.displayName}</strong>{" "}
                  ส่งคำขอเป็นเพื่อนถึงคุณ
                  <div className="friend-request-actions">
                    <button
                      className="accept-btn"
                      onClick={() => {
                        handleFriendRequestResponse(
                          newFriendRequest.id,
                          "accept"
                        );
                        setNewFriendRequest(null); // รีเซ็ตการแสดงคำขอเพื่อนเมื่อยอมรับ
                      }}
                    >
                      ยอมรับ
                    </button>
                    <button
                      className="decline-btn"
                      onClick={() => {
                        // ทำเครื่องหมายว่าอ่านแล้วและซ่อนการแจ้งเตือน
                        markNotificationAsRead(newFriendRequest.id);
                      }}
                    >
                      ไม่สนใจ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {error && <div className="error-message">{error}</div>}

        <div className="search-friend-con">
          <input
            type="text"
            placeholder="🔍 Search Friend"
            value={searchTerm}
            onChange={handleSearch}
            className="search-input-friend"
            aria-label="ค้นหาเพื่อน"
          />
        </div>
        <div className="slide-con">
          <h2>Favorite</h2>
          <div
            className={
              filteredFriends.length === filteredUsers.length
                ? "special-friend-list"
                : filteredFriends.length > 0
                ? "con-friend-list"
                : "empty-friend-list"
            }
          >
            <ul className="friend-list">
              {filteredFriends.length > 0 ? (
                filteredFriends.map((friend, index) => (
                  <li key={index} className="button-friend-item">
                    <img
                      src={friend.photoURL}
                      className="friend-photo"
                      alt={friend.displayName}
                    />
                    <div className="friend-detailss">
                      <span className="friend-name">
                        {getnickName.find((n) => n.email === friend.email)
                          ?.nickname || friend.displayName}
                      </span>
                      <span className="friend-email">{friend.email}</span>
                    </div>
                    <div className="con-right">
                      <span
                        className={`status ${
                          friend.isOnline ? "online" : "offline"
                        }`}
                        aria-label={friend.isOnline ? "ออนไลน์" : "ออฟไลน์"}
                      >
                        {friend.isOnline
                          ? "ออนไลน์"
                          : friend.lastSeen
                          ? `ออฟไลน์ - ${formatLastSeen(friend.lastSeen)}`
                          : "ออฟไลน์"}
                      </span>
                      <div
                        className="dropdown-wrapper"
                        ref={(el) => (dropdownRefs.current[friend.email] = el)}
                      >
                        <button
                          onClick={() =>
                            setOpenMenuFor((prev) =>
                              prev === friend.email ? null : friend.email
                            )
                          }
                          className="dropdown-toggle"
                          aria-label="เมนูเพื่อน"
                        >
                          <BsThreeDots size={20} />
                        </button>
                        {openMenuFor === friend.email && (
                          <div
                            className="dropdown-menu"
                            onMouseLeave={() => setOpenMenuFor(null)}
                          >
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                handleProfileClick(friend);
                                fetchFollowInfo(friend.email);
                                setOpenMenuFor(null);
                              }}
                              aria-label="ดูโปรไฟล์"
                            >
                              Profile
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                if (
                                  !currentUserfollow ||
                                  !Array.isArray(currentUserfollow.following)
                                )
                                  return;
                                handleFollow(friend.email);
                              }}
                              aria-label={
                                Array.isArray(currentUserfollow?.following) &&
                                currentUserfollow.following.includes(
                                  friend.email
                                )
                                  ? "Following"
                                  : "Follow"
                              }
                            >
                              {Array.isArray(currentUserfollow?.following) &&
                              currentUserfollow.following.includes(friend.email)
                                ? "Following"
                                : "Follow"}
                            </button>
                            <button
                              className="dropdown-item danger"
                              onClick={() => {
                                handleRemoveFriend(friend.email);
                                setOpenMenuFor(null);
                              }}
                              disabled={loadingFriendEmail === friend.email}
                              aria-label="ลบเพื่อน"
                            >
                              {loadingFriendEmail === friend.email
                                ? "Deleting..."
                                : "Delete Friend"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <div className="empty-friend">
                  <div className="roomlist-empty-loading">
                    <div className="roomlist-empty-spinner">
                      <div className="roomlist-empty-bar"></div>
                      <div className="roomlist-empty-bar"></div>
                      <div className="roomlist-empty-bar"></div>
                      <div className="roomlist-empty-bar"></div>
                    </div>
                    <div className="roomlist-empty-text">
                      ยังไม่มีเพื่อนในรายการโปรด
                    </div>
                  </div>
                </div>
              )}
            </ul>
          </div>
          <h2>Online Users</h2>
          <div
            className={
              filteredUsers.filter(
                (user) => !isFriend(user.email) && user.isOnline === true
              ).length > 0 && filteredFriends.length === 0
                ? "special-friend-recommand"
                : filteredUsers.filter(
                    (user) => !isFriend(user.email) && user.isOnline === true
                  ).length === 0
                ? "empty-friend-recommand"
                : "con-friend-recommand"
            }
          >
            {filteredUsers.filter(
              (user) => !isFriend(user.email) && user.isOnline === true
            ).length === 0 && (
              <div className="empty-friend">
                <div className="roomlist-empty-loading">
                  <div className="roomlist-empty-text">
                    ไม่มีผู้ใช้ที่ออนไลน์อยู่ในขณะนี้
                  </div>
                </div>
              </div>
            )}
            <ul className="friend-recommend">
              {!loadingCurrentUser &&
                filteredUsers
                  .filter(
                    (user) => !isFriend(user.email) && user.isOnline === true
                  )
                  .map((user, index) => (
                    <li key={index} className="button-friend-item">
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="friend-photo"
                      />
                      <div className="friend-detailss">
                        <span className="friend-name">
                          {getnickName.find((n) => n.email === user.email)
                            ?.nickname || user.displayName}
                        </span>
                        <span className="friend-email">{user.email}</span>
                      </div>
                      <div className="con-right">
                        <span
                          className={`status ${
                            user.isOnline ? "online" : "offline"
                          }`}
                          aria-label={user.isOnline ? "ออนไลน์" : "ออฟไลน์"}
                        >
                          {user.isOnline
                            ? "ออนไลน์"
                            : user.lastSeen
                            ? `ออฟไลน์ - ${formatLastSeen(user.lastSeen)}`
                            : "ออฟไลน์"}
                        </span>
                        <button
                          className="add-friend-btn"
                          onClick={() => handleAddFriend(user.email)}
                          disabled={loadingFriendEmail === user.email}
                          aria-label="เพิ่มเพื่อน"
                        >
                          {loadingFriendEmail === user.email ? (
                            "กำลังเพิ่ม..."
                          ) : (
                            <IoMdPersonAdd />
                          )}
                        </button>
                        <div
                          className="dropdown-wrapper"
                          ref={(el) => (dropdownRefs.current[user.email] = el)}
                        >
                          <button
                            onClick={() =>
                              setOpenMenuFor((prev) =>
                                prev === user.email ? null : user.email
                              )
                            }
                            className="dropdown-toggle"
                            aria-label="เมนูผู้ใช้"
                          >
                            <BsThreeDots size={20} />
                          </button>
                          {openMenuFor === user.email && (
                            <div
                              className="dropdown-menu"
                              onMouseLeave={() => setOpenMenuFor(null)}
                            >
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  handleProfileClick(user);
                                  setOpenMenuFor(null);
                                }}
                                aria-label="ดูโปรไฟล์"
                              >
                                Profile
                              </button>
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  if (
                                    !currentUserfollow ||
                                    !Array.isArray(currentUserfollow.following)
                                  )
                                    return;
                                  handleFollow(user.email);
                                }}
                                aria-label={
                                  Array.isArray(currentUserfollow?.following) &&
                                  currentUserfollow.following.includes(
                                    user.email
                                  )
                                    ? "Following"
                                    : "Follow"
                                }
                              >
                                {Array.isArray(currentUserfollow?.following) &&
                                currentUserfollow.following.includes(user.email)
                                  ? "Following"
                                  : "Follow"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
            </ul>
          </div>
        </div>
        {isModalOpen && selectedUser && (
          <div className="profile-modal">
            <div className="modal-content" ref={modalRef}>
              <div className="profile-info">
                <img
                  src={selectedUser.photoURL}
                  alt={selectedUser.displayName}
                  className="profile-photo"
                />
                <h2>
                  {getnickName.find((n) => n.email === selectedUser.email)
                    ?.nickname || selectedUser.displayName}
                </h2>
                <div className="tabs">
                  <ul className="followers">
                    <li>{followers.length} followers</li>
                  </ul>
                  <ul className="following">
                    <li>{following.length} following</li>
                  </ul>
                </div>
                <p>Email: {selectedUser.email}</p>
                <p>
                  สถานะ:{" "}
                  {selectedUser.isOnline
                    ? "ออนไลน์"
                    : selectedUser.lastSeen
                    ? `ออฟไลน์ - เห็นล่าสุด ${formatLastSeen(
                        selectedUser.lastSeen
                      )}`
                    : "ออฟไลน์"}
                </p>
                <button
                  className="close-btn"
                  onClick={handleCloseModal}
                  aria-label="ปิดโปรไฟล์"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireLogin>
  );
};

export default Friend;
