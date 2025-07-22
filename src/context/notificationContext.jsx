import React, { createContext, useState, useContext, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import { toast } from "react-toastify";

// สร้าง socket instance พร้อม options เพื่อแก้ปัญหาการเชื่อมต่อ
const socket = io(import.meta.env.VITE_APP_API_BASE_URL, {
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ["websocket", "polling"],
  autoConnect: true,
  forceNew: false,
  query: { clientId: 'notification-context-' + Date.now() }
});

// สร้าง Context
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [newFriendRequest, setNewFriendRequest] = useState(null);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  
  // ข้อมูลผู้ใช้จาก localStorage
  const userEmail = localStorage.getItem("userEmail");
  const displayName = localStorage.getItem("userName");
  const photoURL = localStorage.getItem("userPhoto");

  // โหลดการแจ้งเตือนจาก localStorage เมื่อเริ่มต้น
  useEffect(() => {
    if (userEmail) {
      const savedNotifications = localStorage.getItem(`notifications_${userEmail}`);
      if (savedNotifications) {
        try {
          const parsedNotifications = JSON.parse(savedNotifications);
          setNotifications(parsedNotifications);
        } catch (error) {
          console.error("Error parsing notifications from localStorage:", error);
        }
      }
    }
  }, [userEmail]);

  // บันทึกการแจ้งเตือนลงใน localStorage ทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    if (userEmail && notifications.length > 0) {
      localStorage.setItem(`notifications_${userEmail}`, JSON.stringify(notifications));
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
      }
    }
  }, [notifications, newFriendRequest, userEmail]);

  // Socket connection handling
  useEffect(() => {
    if (!userEmail) return;

    // ฟังการแจ้งเตือนเมื่อมีคนส่งคำขอเพื่อนใหม่
    socket.on("notify-friend-request", async () => {
      try {
        // ดึงข้อมูลคำขอเพื่อนล่าสุดผ่าน REST API
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/api/friend-requests/${userEmail}`
        );

        // ถ้าไม่มีคำขอเพื่อนใหม่
        if (!response.data || !response.data.requests || response.data.requests.length === 0) {
          return;
        }

        // หาคำขอเพื่อนล่าสุด
        const latestRequest = response.data.requests[0];

        // สร้าง ID สำหรับคำขอ
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
        console.error("Error handling friend request notification:", error);
      }
    });

    return () => {
      socket.off("notify-friend-request");
    };
  }, [userEmail]);

  // ฟังก์ชันสำหรับการทำเครื่องหมายว่าแจ้งเตือนได้อ่านแล้ว
  const markNotificationAsRead = (notificationId) => {
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

  // ฟังก์ชันสำหรับจัดการกับการตอบกลับคำขอเป็นเพื่อน
  const handleFriendRequestResponse = async (requestId, response, roomId) => {
    // ทำเครื่องหมายว่าอ่านแล้ว
    markNotificationAsRead(requestId);

    // ถ้าตอบรับเป็นเพื่อน
    if (response === "accept") {
      // แจ้งกลับไปยังผู้ส่งคำขอว่าได้ตอบรับแล้ว
      const notification = notifications.find((n) => n.id === requestId);
      if (notification) {
        try {
          // ใช้ roomId ที่ส่งเข้ามา ถ้าไม่มีให้ gen ใหม่
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
          
          await axios.post(
            `${import.meta.env.VITE_APP_API_BASE_URL}/api/add-friend`,
            {
              userEmail: notification.from.email,
              friendEmail: userEmail,
              roomId: requestId,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          // แจ้ง Toast
          toast.success(`คุณได้ตอบรับคำขอเป็นเพื่อนจาก ${notification.from.displayName} แล้ว`, {
            position: "bottom-right",
            autoClose: 3000,
          });
          
          // Emit socket event
          if (socket.connected) {
            socket.emit("notify-friend-accept", { to: notification.from.email });
          }

          return true;
        } catch (error) {
          console.error("เกิดข้อผิดพลาดในการตอบรับคำขอเพื่อน:", error);
          toast.error("ไม่สามารถตอบรับคำขอเพื่อนได้");
          return false;
        }
      }
    }
    return false;
  };

  // ฟังก์ชันสำหรับลบคำขอเพื่อน
  const handleDeleteFriendRequest = async (requestId) => {
    // ทำเครื่องหมายว่าอ่านแล้ว
    markNotificationAsRead(requestId);

    try {
      // ค้นหาข้อมูลการแจ้งเตือนคำขอเพื่อน
      const notification = notifications.find((n) => n.id === requestId);
      if (notification) {
        // ส่งคำขอไปยัง API เพื่อลบคำขอเพื่อน
        await axios.delete(
          `${import.meta.env.VITE_APP_API_BASE_URL}/api/friend-request/${requestId}`
        );

        // อัพเดต UI โดยการลบคำขอนี้ออกจาก notifications
        setNotifications(prevNotifications => 
          prevNotifications.filter(n => n.id !== requestId)
        );

        toast.info(`คุณได้ปฏิเสธคำขอเป็นเพื่อนจาก ${notification.from.displayName} แล้ว`, {
          position: "bottom-right",
          autoClose: 3000,
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบคำขอเพื่อน:", error);
      toast.error("ไม่สามารถลบคำขอเพื่อนได้");
      return false;
    }
  };

  // ฟังก์ชันสำหรับล้างการแจ้งเตือนที่อ่านแล้ว
  const clearReadNotifications = () => {
    setNotifications(prevNotifications => {
      // กรองเอาเฉพาะการแจ้งเตือนที่ยังไม่ได้อ่าน
      const unreadNotifications = prevNotifications.filter(n => !n.read);
      return unreadNotifications;
    });
  };

  // Toggle notification dropdown
  const toggleNotificationDropdown = (value = null) => {
    setShowNotificationDropdown(prev => value !== null ? value : !prev);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        newFriendRequest,
        showNotificationDropdown,
        toggleNotificationDropdown,
        markNotificationAsRead,
        clearReadNotifications,
        handleFriendRequestResponse,
        handleDeleteFriendRequest
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook สำหรับใช้งาน context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
