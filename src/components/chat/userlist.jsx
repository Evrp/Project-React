import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "../chat/Chat.css";

const ListUser = ({
  sortedFriends,
  lastMessages,
  setActiveUser,
  setIsGroupChat,
  dropdownRefs,
  getnickName,
  setFriends,
  setActiveRoomId, // เพิ่ม prop
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [currentUserfollow, setCurrentUserfollow] = useState(null);
  const [followers, setFollowers] = useState([]); /// เพิ่ม followers
  const [following, setFollowing] = useState([]); /// เพิ่ม following
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingFriendEmail, setLoadingFriendEmail] = useState(null);
  const modalRef = useRef(null);
  //   const [dropdownRefs, setDropdownRefs] = useState({});
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    fetchGmailUser();
  }, [
    sortedFriends,
    lastMessages,
    setActiveUser,
    setIsGroupChat,
    dropdownRefs,
    getnickName,
    setFriends,
  ]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideAny = Object.values(dropdownRefs.current).some((ref) =>
        ref?.contains(event.target)
      );
      if (!isClickInsideAny) {
        setOpenMenuFor(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleCloseModal();
    }
  };
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

  const handleRemoveFriend = async (friendEmail) => {
    try {
      setLoadingFriendEmail(friendEmail);

      await axios.delete(
        `${import.meta.env.VITE_APP_API_BASE_URL
        }/api/users/${userEmail}/friends/${friendEmail}`
      );

      // อัปเดตรายชื่อเพื่อนหลังจากลบ
      setFriends((prevFriends) =>
        prevFriends.filter((friend) => friend.email !== friendEmail)
      );
      toast.success("ลบเพื่อนสําเร็จ!");
    } catch (err) {
      console.error("Failed to remove friend:", err);
      alert("เกิดข้อผิดพลาดในการลบเพื่อน");
    } finally {
      setLoadingFriendEmail(null);
    }
  };

  const fetchGmailUser = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/users/${userEmail}`
      );
      setCurrentUserfollow(res.data);
    } catch (err) {
      console.error("โหลด Gmail currentUser ไม่ได้:", err);
    }
  };

  const handleFollow = async (targetEmail) => {
    await fetchGmailUser();
    if (!currentUserfollow || !Array.isArray(currentUserfollow.following)) {
      console.warn("currentUser ยังไม่พร้อม หรือ following ไม่มี");
      return;
    }

    const isFollowing = currentUserfollow.following.includes(targetEmail);
    const url = `${import.meta.env.VITE_APP_API_BASE_URL
      }/api/users/${userEmail}/${isFollowing ? "unfollow" : "follow"
      }/${targetEmail}`;
    const method = isFollowing ? "DELETE" : "POST";

    try {
      await axios({ method, url });
      await fetchGmailUser();
      toast.success("ติดตามสำเร็จ!");
    } catch (err) {
      console.error("Follow/unfollow error:", err);
      toast.error("ติดตามล้มเหลว!");
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMenuClick = (friend) => {
    setOpenMenuFor((prev) => (prev === friend.email ? null : friend.email));
  };
  const fetchFollowInfo = async (targetEmail) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL
        }/api/user/${targetEmail}/follow-info`
      );

      setFollowers(res.data.followers);
      setFollowing(res.data.following);
    } catch (error) {
      console.error("Error fetching follow info:", error);
    }
  };
  const handleProfileClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // ฟังก์ชันสร้าง roomId สำหรับ one-to-one chat (เรียง email เพื่อ unique)
  const getRoomIdForFriend = (friendEmail) => {
    const emails = [userEmail, friendEmail].sort();
    return `room__${emails[0]}__${emails[1]}`;
  };
  const handleEnterRoom = (roomId) => {
    navigate(`/chat/${roomId}`);
    // handleAddCommunity(roomId, roomName);
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
                  className="chat-friend-item"
                  onClick={() => {
                    setActiveUser(friend.email);
                    setIsGroupChat(false);
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
                    <span
                      className={`status ${friend.isOnline ? "online" : "offline"
                        }`}
                    >
                      {friend.isOnline ? "ออนไลน์" : "ออฟไลน์"}
                    </span>
                    <div
                      className="chat-dropdown-wrapper"
                      ref={(el) => (dropdownRefs.current[friend.email] = el)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => handleMenuClick(friend)}
                        className="chat-dropdown-toggle"
                      >
                        <BsThreeDots size={20} />
                      </button>
                      {openMenuFor === friend.email && (
                        <div className="chat-dropdown-menu">
                          <button
                            className="chat-dropdown-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProfileClick(friend);
                              fetchFollowInfo(friend.email);
                              setOpenMenuFor(null);
                            }}
                          >
                            👤 ดูโปรไฟล์
                          </button>
                          <button
                            className="chat-dropdown-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollow(friend.email);
                            }}
                          >
                            {Array.isArray(currentUserfollow?.following) &&
                              currentUserfollow.following.includes(friend.email)
                              ? "🔔 กำลังติดตาม"
                              : "➕ ติดตาม"}
                          </button>
                          <button
                            className="chat-dropdown-item chat-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFriend(friend.email);
                              setOpenMenuFor(null);
                            }}
                            disabled={loadingFriendEmail === friend.email}
                          >
                            {loadingFriendEmail === friend.email
                              ? "กำลังลบ..."
                              : "🗑️ ลบเพื่อน"}
                          </button>
                        </div>
                      )}
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
      {isModalOpen && selectedUser && (
        <div className="profile-modal">
          <div className="modal-content" ref={modalRef}>
            <div className="profile-info">
              <img
                src={Array.isArray(getnickName)
                  ? getnickName.find((n) => n.email === selectedUser.email)?.nickname || selectedUser.photoURL
                  : selectedUser.photoURL}
                alt={
                  Array.isArray(getnickName)
                    ? getnickName.find((n) => n.email === selectedUser.email)?.nickname || selectedUser.displayName
                    : selectedUser.displayName
                }
                className="profile-photo"
              />
              <h2>
                {Array.isArray(getnickName)
                  ? getnickName.find((n) => n.email === selectedUser.email)?.nickname || selectedUser.displayName
                  : selectedUser.displayName}
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
              <p>สถานะ: {selectedUser.isOnline ? "ออนไลน์" : "ออฟไลน์"}</p>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default ListUser;
