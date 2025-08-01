import React, { useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "../chat/Chat.css";

const ListUser = ({
  sortedFriends,
  lastMessages,
  setActiveUser,
  setIsGroupChat,
  selectedTab,
  setSelectedTab,
  setIsOpen,
  setOpenchat,
  isOpen,
  dropdownRefs,
  setUserImage,
  setActiveRoomId, // เพิ่ม prop
  formatOnlineStatus, // เพิ่ม prop สำหรับแสดงสถานะออนไลน์
}) => {
  console.log("sortedFriends:", sortedFriends);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return "เมื่อสักครู่";
    if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
    if (diffHour < 24) return `${diffHour} ชม.ที่แล้ว`;

    return timestamp.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };


  // ฟังก์ชันสร้าง roomId สำหรับ one-to-one chat (เรียง email เพื่อ unique)
  const getRoomIdForFriend = (friendEmail) => {
    const emails = [userEmail, friendEmail].sort();
    return `room__${emails[0]}__${emails[1]}`;
  };
  const handleEnterRoom = (roomId) => {
    navigate(`/chat/${roomId}`);
  };
  return (
    <div className="favorite-container">
      <div className="favorite-toggle" onClick={handleToggle}>
        {isOpen ? <FaChevronDown /> : <FaChevronRight />}
        <span>Favorite</span>
      </div>
      {isOpen && (
        <div className="favorite-container-open">
          <ul className="friend-list-chat">
            {sortedFriends.length > 0 ? (
              sortedFriends.map((friend, index) => (
                <li
                  key={index}
                  className={`chat-friend-item ${selectedTab === friend.email ? 'selected' : ''}`}
                  onClick={() => {
                    setUserImage(friend);
                    handleEnterRoom(friend.roomId);
                    setActiveUser(friend.email);
                    setOpenchat(true);
                    setIsGroupChat(false);
                    setSelectedTab(friend.email);
                    if (setActiveRoomId)
                      setActiveRoomId(getRoomIdForFriend(friend.email));
                  }}
                >
                  <img
                    src={friend.photoURL}
                    alt={friend.displayName}
                    className="friend-photo"
                  />
                  <div className="friend-details">
                    <span className="friend-name">{friend.displayName}</span>
                    <div className="row-last-time">
                      <span className="last-message">
                        {lastMessages[friend.email]?.content ||
                          "ยังไม่มีข้อความ"}
                      </span>
                      <span className="message-time">
                        {lastMessages[friend.email]?.timestamp &&
                          formatRelativeTime(
                            lastMessages[friend.email].timestamp.toDate()
                          )}
                      </span>
                    </div>
                  </div>
                  <div className="con-right">
                    <div
                      className={`online-status ${friend.isOnline ? "status-online" : "status-offline"
                        }`}
                    >
                      <span className="online-indicator"></span>
                      {formatOnlineStatus ? formatOnlineStatus(friend) :
                        (friend.isOnline ? "ออนไลน์" : "ออฟไลน์")}
                    </div>

                  </div>
                </li>
              ))
            ) : (
              <p>ไม่พบเพื่อนที่ตรงกับคำค้นหา</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ListUser;
