import React, { useEffect, useState, useRef, createRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TinderCard from "react-tinder-card";
import { useTheme } from "../../context/themecontext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlineRefresh } from "react-icons/md";

import "./roommatch.css";
import "./chance-badge.css";

const RoomMatch = () => {
  const userEmail = localStorage.getItem("userEmail");
  const { isDarkMode } = useTheme();
  const [rooms, setRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const childRefs = useRef([]);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL
          }/api/events-match/${userEmail}`
        );
        const filterjoinedRooms = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/api/user-rooms/${userEmail}`
        );
        // แปลง roomIds เป็น string ทั้งหมด
        const joinedIds = Array.isArray(filterjoinedRooms.data.roomIds)
          ? filterjoinedRooms.data.roomIds.filter((id) => !!id).map(String)
          : [];
        setJoinedRooms(joinedIds);
        setRooms(res.data);
        setCurrentIndex(res.data.length - 1);
        childRefs.current = Array(res.data.length)
          .fill(0)
          .map((_, i) => childRefs.current[i] || createRef());
      } catch (error) {
        console.error("โหลดห้องไม่สำเร็จ:", error);
      }
      setLoading(false);
    };
    fetchRooms();
  }, [userEmail]);
  const filteredRooms = rooms.filter(
    (room) => !joinedRooms.includes(String(room._id))
  );

  useEffect(() => {
    const fetchGmails = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/api/users`
        );
        setUsers(res.data);
      } catch (error) {
        console.error("โหลดห้องไม่สำเร็จ:", error);
      }
    };
    fetchGmails();
  }, []);

  const handleEnterRoom = (roomId, roomName) => {
    navigate(`/chat/${roomId}`);
    handleAddCommunity(roomId, roomName);
  };
  const handleAddCommunity = async (roomId, roomName) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/join-community`,
        {
          userEmail,
          roomId,
          roomName,
        }
      );
      toast.success("เข้าร่วมห้องสําเร็จ!");
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("ไม่สามารถเพิ่มเพื่อนได้");
    }
  };
  const swiped = (direction, roomId, roomName, index) => {
    if (direction === "right") {
      handleEnterRoom(roomId, roomName);
    }
    setCurrentIndex((prev) => prev - 1);
  };

  const swipe = async (dir) => {
    if (currentIndex >= 0 && currentIndex < rooms.length) {
      await childRefs.current[currentIndex]?.current?.swipe(dir);
    }
  };
  const getHighResPhoto = (url) => {
    if (!url) return url;
    // รองรับทั้ง ...=s96-c และ ...=s96-c&... หรือ ...=s96-c?... (กรณีมี query string ต่อท้าย)
    return url.replace(/=s\d+-c(?=[&?]|$)/, "=s400-c");
  };
  return (
    <div className={`room-match-container ${isDarkMode ? "dark-mode" : ""}`}>
      {loading && (
        <div className="roommatch-loading-overlay">
          <div className="roommatch-spinner">
            <div className="roommatch-dot"></div>
            <div className="roommatch-dot"></div>
            <div className="roommatch-dot"></div>
          </div>
          <div className="roommatch-loading-text">
            กำลังโหลดห้องแนะนำ กรุณารอสักครู่...
          </div>
        </div>
      )}
      <div className="card-stack">
        {!loading && filteredRooms.length === 0 && (
          <div className="roommatch-tindercard-loading">
            <div className="roommatch-tindercard-spinner">
              <div className="roommatch-tindercard-bar"></div>
              <div className="roommatch-tindercard-bar"></div>
              <div className="roommatch-tindercard-bar"></div>
              <div className="roommatch-tindercard-bar"></div>
            </div>
            <div className="roommatch-tindercard-loading-text">
              ไม่พบห้องที่เหมาะสม หรือคุณปัดหมดแล้ว
              <br />
              กำลังค้นหาห้องใหม่...
            </div>
          </div>
        )}
          {!loading &&
          filteredRooms.length > 0 &&
          filteredRooms.map((room, index) => (
            <div className="container-tinder-card" key={room._id}>
            <TinderCard
              ref={childRefs.current[index]}
              key={room._id}
              onSwipe={(dir) => swiped(dir, room._id, room.title, index)}
              preventSwipe={["up", "down"]}
              className="tinder-card"
            >
              <div className="room-card-match">
                <div className="room-chance-badge">โอกาสแมช {room.chance}</div>
                {/* หา user ที่ email ตรงกับ room.email เพื่อเอารูป */}
                {(() => {
                  const user = users.find((u) => u.email === room.usermatch);
                  if (user && user.photoURL) {
                    return (
                      <img
                        src={getHighResPhoto(user.photoURL)}
                        alt="room"
                        className="room-image-match" // เพิ่มคลาส room-image-full
                      />
                    );
                  }
                  return (
                    <div className="tinder-card-inner-loading">
                      <div className="tinder-card-spinner">
                        <div className="tinder-card-dot"></div>
                        <div className="tinder-card-dot"></div>
                        <div className="tinder-card-dot"></div>
                      </div>
                      <div className="tinder-card-loading-text">
                        กำลังโหลดข้อมูลห้อง...
                      </div>
                    </div>
                  );
                })()}
                <div className="room-match-info">
                  {/* <h4>{room.title}</h4> */}
                  <p>{room.usermatch}</p>
                  <p>{room.title}</p>
                </div>
              </div>
            </TinderCard></div>

          ))}
      </div>

      <div className="button-group">
        <button
          onClick={async () => {
            // ลบ event match เฉพาะห้องที่แสดงอยู่ (current)
            if (currentIndex >= 0 && currentIndex < filteredRooms.length) {
              const currentRoom = filteredRooms[currentIndex];
              if (currentRoom && currentRoom.roomId) {
                await fetch(
                  `${import.meta.env.VITE_APP_API_BASE_URL}/api/delete-event-match/${currentRoom.roomId}`,
                  { method: "DELETE" }
                );
              }
            }
            swipe("left");
          }}
          className="skip-button"
          disabled={loading}
        >
          Skip
        </button>
        <button
          onClick={() =>
            currentIndex >= 0 &&
            handleEnterRoom(rooms[currentIndex]._id, rooms[currentIndex].title)
          }
          className="join-button"
          disabled={loading}
        >
          Join
        </button>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default RoomMatch;
