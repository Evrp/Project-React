import React, { useEffect, useState, useRef, createRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TinderCard from "react-tinder-card";
import { useTheme } from "../../context/themecontext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlineRefresh } from "react-icons/md";
import { FiHeart, FiX } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

import "./roommatch.css";
import "./chance-badge.css";

const RoomMatch = ({ accordionComponent }) => {
  const userEmail = localStorage.getItem("userEmail");
  const { isDarkMode } = useTheme();
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const childRefs = useRef([]);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 990);
  const [loading, setLoading] = useState(true);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedRoom, setMatchedRoom] = useState(null);

  // ตรวจสอบขนาดหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 990);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL
          }/api/events-match/${userEmail}`
        );
        const matchInfo = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/api/infomatch/all`
        );
        setRooms(matchInfo.data.data);

      } catch (error) {
        console.error("โหลดห้องไม่สำเร็จ:", error);
        setRooms([]);
      }
      setLoading(false);
    };
    fetchRooms();
  }, [userEmail]);
  const filteredRooms = Array.isArray(rooms)
    ? rooms.filter((room) => {
      // เช็คว่า email ของเราอยู่ใน usermatch หรือ email
      const isUserInRoom =
        room.usermatch === userEmail || room.email === userEmail;
      if (!isUserInRoom) return false;

      // ถ้าเราอยู่ใน usermatch ให้เช็ค usermatchjoined ต้องเป็น false
      if (room.usermatch === userEmail && room.usermatchjoined === true) {
        return false;
      }

      // ถ้าเราอยู่ใน email ให้เช็ค emailjoined ต้องเป็น false
      if (room.email === userEmail && room.emailjoined === true) {
        return false;
      }

      return true;
    })
    : [];
  useEffect(() => {
    try {
      setCurrentIndex((filteredRooms || []).length - 1);
      childRefs.current = Array((filteredRooms || []).length)
        .fill(0)
        .map((_, i) => childRefs.current[i] || createRef());
    } catch (error) {
      console.error("Error fetching match info:", error);
    }

  }, []);
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
  useEffect(() => {
    try {

      setCurrentIndex((filteredRooms || []).length - 1);
      childRefs.current = Array((filteredRooms || []).length)
        .fill(0)
        .map((_, i) => childRefs.current[i] || createRef());
    } catch (error) {
      console.error("โหลดห้องไม่สำเร็จ:", error);
    }
  }, []);

  const handleEnterRoom = async (roomId, roomName) => {
    try {
      console.log("Entering room:", roomId, "with name:", roomName);

      // หา room จาก roomId ที่ส่งมา
      const currentRoom = filteredRooms.find(room => room._id === roomId);
      console.log("Current room found:", currentRoom);
      console.log("filteredRooms:", filteredRooms);

      if (currentRoom && currentRoom._id) {
        let updateData = {};

        // เช็คว่าเราอยู่ใน email หรือ usermatch แล้วอัปเดทค่าที่เกี่ยวข้อง
        if (currentRoom.email === userEmail) {
          updateData.emailjoined = true;
        } else if (currentRoom.usermatch === userEmail) {
          updateData.usermatchjoined = true;
        }
        console.log("Update data:", updateData);
        const response = await axios.put(
          `${import.meta.env.VITE_APP_API_BASE_URL}/api/infomatch/${roomId
          }`,
          updateData
        );

        // เช็คว่าทั้งสองฝ่าย join แล้วหรือไม่
        const updatedRoom = response.data;
        if (updatedRoom && updatedRoom.emailjoined && updatedRoom.usermatchjoined) {
          // แสดง Match Modal
          setMatchedRoom(updatedRoom);
          setShowMatchModal(true);

          // เก็บสถานะการแสดงผลเพื่อไม่แสดงซ้ำ
          localStorage.setItem(`match_shown_${updatedRoom._id}`, 'true');
        }
      }

      // ลบห้องที่ไลค์แล้วออกจาก state และไปห้องต่อไป
      const roomIndex = filteredRooms.findIndex(room => room._id === roomId);
      if (roomIndex !== -1) {
        setRooms((prevRooms) =>
          prevRooms.filter((room) => room._id !== roomId)
        );
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      }

      toast.success("คุณกดไลค์แล้ว!");
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("ไม่สามารถเพิ่มเพื่อนได้");
    }
  };
  const swiped = async (direction, roomId, roomName, index) => {
    if (direction === "right") {
      handleEnterRoom(roomId, roomName);
    } else if (direction === "left") {
      // ลบข้อมูลเมื่อ swipe ซ้าย (เหมือนปุ่ม skip)
      const currentRoom = filteredRooms[currentIndex];
      console.log("Swiped left - deleting room:", currentRoom._id);

      if (currentRoom && currentRoom._id) {
        try {
          await fetch(
            `${import.meta.env.VITE_APP_API_BASE_URL}/api/infomatch/${currentRoom._id
            }`,
            { method: "DELETE" }
          );

          // ลบออกจาก state
          setRooms((prevRooms) =>
            prevRooms.filter((_, roomIndex) => roomIndex !== currentIndex)
          );
          setCurrentIndex((prev) => Math.max(0, prev - 1));
        } catch (error) {
          console.error("Error deleting info match:", error);
        }
      }
    }
  };

  const swipe = async (dir) => {
    if (currentIndex >= 0 && currentIndex < rooms.length) {
      await childRefs.current[currentIndex]?.current?.swipe(dir);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // ปิด modal เมื่อคลิกที่ overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Modal Wrapper Component
  const ModalWrapper = ({ children }) => {
    if (!isMobile) {
      return children; // แสดงแบบปกติในหน้าจอใหญ่
    }

    return (
      <>
        {/* <MobileToggleButton /> */}
        <div
          className={`roommatch-modal-overlay ${isModalOpen ? "active" : ""}`}
          onClick={handleOverlayClick}
        >
          <div
            className={`roommatch-modal-sheet ${isModalOpen ? "active" : ""}`}
          >
            <div className="roommatch-modal-header">
              <div className="roommatch-modal-handle"></div>
              <button className="roommatch-modal-close" onClick={closeModal}>
                <FiX />
              </button>
            </div>
            <div className="roommatch-modal-content">{children}</div>
          </div>
        </div>
      </>
    );
  };

  const getHighResPhoto = (url) => {
    if (!url) return url;
    // รองรับทั้ง ...=s96-c และ ...=s96-c&... หรือ ...=s96-c?... (กรณีมี query string ต่อท้าย)
    return url.replace(/=s\d+-c(?=[&?]|$)/, "=s400-c");
  };
  return (
    <ModalWrapper>
      <div
        className={`room-match-container ${isDarkMode ? "dark-mode" : ""} ${isModalOpen ? "modal-active" : ""
          }`}
      >
        {/* Show AccordionList on mobile only */}
        {isMobile && accordionComponent && (
          <div className="roommatch-accordion-mobile">{accordionComponent}</div>
        )}

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
                    <div className="room-chance-badge">
                      โอกาสแมช {room.chance}
                    </div>
                    {/* หา user ที่ email ตรงกับ room.email เพื่อเอารูป */}
                    {(() => {
                      const user = users.find(
                        (u) => (room.email !== userEmail ? u.email === room.email : u.email === room.usermatch)
                      );
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
                      <h5>{room.email !== userEmail ? room.email : room.usermatch}</h5>
                      <p>
                        มีความสนใจในเรื่อง {room.title || room.detail} เหมือนคุณ
                      </p>
                    </div>
                  </div>
                </TinderCard>
              </div>
            ))}
        </div>

        <div className="button-group">
          <button
            onClick={async () => {
              // ลบ event match เฉพาะห้องที่แสดงอยู่ (current)
              if (currentIndex >= 0 && currentIndex < filteredRooms.length) {
                const currentRoom = filteredRooms[currentIndex];
                console.log("Current room to delete:", currentRoom._id);

                if (currentRoom && currentRoom._id) {
                  try {
                    await fetch(
                      `${import.meta.env.VITE_APP_API_BASE_URL}/api/infomatch/${currentRoom._id
                      }`,
                      { method: "DELETE" }
                    );

                    // ลบออกจาก state
                    setRooms((prevRooms) =>
                      prevRooms.filter(
                        (_, roomIndex) => roomIndex !== currentIndex
                      )
                    );
                    setCurrentIndex((prev) => Math.max(0, prev - 1));
                  } catch (error) {
                    console.error("Error deleting info match:", error);
                  }
                }
              }
            }}
            className="skip-button"
            disabled={loading}
          >
            Skip
          </button>
          <button
            onClick={() =>
              currentIndex >= 0 && filteredRooms[currentIndex] && handleEnterRoom(filteredRooms[currentIndex]._id)
            }
            className="join-button"
            disabled={loading}
          >
            Like
          </button>
        </div>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

        {/* Match Modal - เหมือน Tinder */}
        {showMatchModal && matchedRoom && (
          <div className="match-modal-overlay">
            <div className="match-modal">
              <div className="match-celebration">
                <div className="floating-hearts">
                  <FaHeart className="heart heart-1" />
                  <FaHeart className="heart heart-2" />
                  <FaHeart className="heart heart-3" />
                  <FaHeart className="heart heart-4" />
                  <FaHeart className="heart heart-5" />
                </div>

                <div className="match-text">
                  <h1>IT'S A MATCH!</h1>
                  <p>You and {matchedRoom.email !== userEmail ? matchedRoom.email : matchedRoom.usermatch} liked each other</p>
                </div>

                <div className="match-users">
                  <div className="user-avatar">
                    <img
                      src={(() => {
                        const currentUser = users.find(u => u.email === userEmail);
                        return currentUser ? getHighResPhoto(currentUser.photoURL) : "https://via.placeholder.com/80";
                      })()}
                      alt="Your Avatar"
                    />
                  </div>
                  <FaHeart className="match-heart" />
                  <div className="user-avatar">
                    <img
                      src={(() => {
                        const partnerEmail = matchedRoom.email !== userEmail ? matchedRoom.email : matchedRoom.usermatch;
                        const partnerUser = users.find(u => u.email === partnerEmail);
                        return partnerUser ? getHighResPhoto(partnerUser.photoURL) : "https://via.placeholder.com/80";
                      })()}
                      alt={matchedRoom.email !== userEmail ? matchedRoom.email : matchedRoom.usermatch}
                    />
                  </div>
                </div>

                <div className="match-actions">
                  <button
                    className="match-close-btn"
                    onClick={() => setShowMatchModal(false)}
                  >
                    Continue Swiping
                  </button>
                  <button
                    className="match-chat-btn"
                    onClick={() => {
                      setShowMatchModal(false);
                      navigate(`/chat/${matchedRoom._id}`);
                    }}
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

export default RoomMatch;
