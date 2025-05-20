import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./friend.css";
import { IoMdPersonAdd } from "react-icons/io";
import RequireLogin from "../ui/RequireLogin";
import { BsThreeDots } from "react-icons/bs";
const socket = io("http://localhost:8080");

const Friend = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingFriendEmail, setLoadingFriendEmail] = useState(null);
  const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);
  const modalRef = useRef(null);
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const menuRef = useRef();

  const userEmail = localStorage.getItem("userEmail");
  const displayName = localStorage.getItem("userName");
  const photoURL = localStorage.getItem("userPhoto");
  const fetchCurrentUserAndFriends = async () => {
    try {
      const encodedEmail = encodeURIComponent(userEmail);
      const userRes = await axios.get(
        `http://localhost:8080/api/users/${encodedEmail}`
      );
      const currentUser = userRes.data;

      if (Array.isArray(currentUser.friends)) {
        const friendEmails = currentUser.friends;

        // ดึง users ทั้งหมดมาเพื่อจับคู่กับ friend emails
        const allUsersRes = await axios.get("http://localhost:8080/api/users");
        const allUsers = allUsersRes.data;

        const filteredFriends = allUsers
          .filter((user) => friendEmails.includes(user.email))
          .map((user) => ({
            photoURL: user.photoURL,
            email: user.email,
            displayName: user.displayName,
            isOnline: user.isOnline || false,
          }))
          .sort((a, b) => a.displayName.localeCompare(b.displayName));
        console.log(filteredFriends); // Debugging: Log filtered friends to the console for inspection
        setFriends(filteredFriends);
        setUsers(allUsers);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error("Error fetching current user or friends:", error);
    }
  };

  useEffect(() => {
    if (!userEmail) return;

    fetchCurrentUserAndFriends();

    socket.emit("user-online", { displayName, photoURL, email: userEmail });

    socket.on("update-users", (onlineUsers) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => ({
          ...user,
          isOnline: onlineUsers.includes(user.email),
        }))
      );
      setFriends((prevFriends) =>
        prevFriends.map((friend) => ({
          ...friend,
          isOnline: onlineUsers.includes(friend.email),
        }))
      );
    });

    return () => {
      socket.off("update-users");
    };
  }, [userEmail]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleAddFriend = async (friendEmail) => {
    console.log("Adding friend:", friendEmail);
    console.log("User email:", userEmail);
    try {
      setLoadingFriendEmail(friendEmail);
      await axios.post("http://localhost:8080/api/add-friend", {
        userEmail,
        friendEmail,
      });

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

      toast.success("เพิ่มเพื่อนสำเร็จ!");
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("ไม่สามารถเพิ่มเพื่อนได้");
    } finally {
      setLoadingFriendEmail(null);
    }
  };

  const handleRemoveFriend = async (friendEmail) => {
    try {
      setLoadingFriendEmail(friendEmail);

      await axios.delete(
        `http://localhost:8080/api/users/${userEmail}/friends/${friendEmail}`
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

  const isFriend = (email) => friends.some((friend) => friend.email === email);

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
        `http://localhost:8080/api/users/${userEmail}`
      );
      const userData = {
        ...res.data,
        following: Array.isArray(res.data.following) ? res.data.following : [],
      };
      setCurrentUser(userData);
      setLoadingCurrentUser(false);
    } catch (err) {
      console.error("Error fetching currentUser:", err);
      setCurrentUser(null);
      setLoadingCurrentUser(false);
    }
  };
  const handleFollow = async (targetEmail) => {
    if (!currentUser || !Array.isArray(currentUser.following)) {
      console.warn("currentUser ยังไม่พร้อม หรือ following ไม่มี");
      return;
    }

    const isFollowing = currentUser.following.includes(targetEmail);
    const url = `http://localhost:8080/api/users/${userEmail}/${
      isFollowing ? "unfollow" : "follow"
    }/${targetEmail}`;
    const method = isFollowing ? "DELETE" : "POST";

    try {
      await axios({ method, url });
      const res = await axios.get(
        `http://localhost:8080/api/users/${userEmail}`
      );
      setCurrentUser(res.data);
      await fetchCurrentUser(); // โหลดใหม่เพื่ออัปเดต following/followers
    } catch (err) {
      console.error("Follow/unfollow error:", err);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuFor(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <RequireLogin>
      <div className="fr-container">
        <div className="text-xl-font-semibold">
          <h1>Friend</h1>
        </div>
        <div className="search-friend-con">
          <input
            type="text"
            placeholder="🔍 Search Friend"
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <h2>Following</h2>
        <ul className="friend-list">
          {friends.length > 0 ? (
            friends.filter((friend) =>
              friend.displayName
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            ).length > 0 ? (
              friends
                .filter((friend) =>
                  friend.displayName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                )
                .map((friend, index) => (
                  <li key={index} className="friend-item">
                    <img
                      src={friend.photoURL}
                      alt={friend.displayName}
                      className="friend-photo"
                    />
                    <div className="friend-detailss">
                      <span className="friend-name">{friend.displayName}</span>
                      <span className="friend-email">{friend.email}</span>
                    </div>
                    <span
                      className={`status ${
                        friend.isOnline ? "online" : "offline"
                      }`}
                    >
                      {friend.isOnline ? "ออนไลน์" : "ออฟไลน์"}
                    </span>
                    <div className="con-dot" ref={menuRef}>
                      <button
                        onClick={() =>
                          setOpenMenuFor((prev) =>
                            prev === friend.email ? null : friend.email
                          )
                        }
                        className="p-2 rounded-full hover:bg-gray-200"
                      >
                        <BsThreeDots size={20} />
                      </button>
                      <div className="div-con">
                        {openMenuFor === friend.email && (
                          <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg border border-gray-200 rounded-lg z-50">
                            <button
                              onClick={() => {
                                handleProfileClick(friend);
                                setOpenMenuFor(null);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              ดูโปรไฟล์
                            </button>
                            <button
                              onClick={() => {
                                handleRemoveFriend(friend.email);
                                setOpenMenuFor(null);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                              disabled={loadingFriendEmail === friend.email}
                            >
                              {loadingFriendEmail === friend.email
                                ? "กำลังลบ..."
                                : "ลบเพื่อน"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))
            ) : (
              <p>ไม่พบเพื่อนที่ตรงกับคำค้นหา</p>
            )
          ) : (
            <div className="div-nofr">
              <p>คุณยังไม่มีเพื่อน</p>
            </div>
          )}
        </ul>

        <h2>Other</h2>
        <ul className="friend-recommend">
          {!loadingCurrentUser &&
            currentUser &&
            filteredUsers
              .filter((user) => !isFriend(user.email))
              .map((user, index) => (
                <li
                  key={index}
                  className="button-friend-item"
                  onClick={() => handleProfileClick(user)} // ← เปลี่ยนตรงนี้
                >
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="friend-photo"
                  />
                  <div className="friend-details">
                    <span className="friend-name">{user.displayName}</span>

                    <span
                      className={`status ${
                        user.isOnline ? "online" : "offline"
                      }`}
                    >
                      {user.isOnline ? "online" : "ออฟไลน์"}
                    </span>
                  </div>
                  <button
                    className="add-friend-btn"
                    onClick={() => handleAddFriend(user.email)}
                    disabled={loadingFriendEmail === user.email}
                  >
                    {loadingFriendEmail === user.email ? (
                      "กำลังเพิ่ม..."
                    ) : (
                      <IoMdPersonAdd />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (!currentUser || !Array.isArray(currentUser.following))
                        return;
                      handleFollow(user.email);
                    }}
                  >
                    {Array.isArray(currentUser?.following) &&
                    currentUser.following.includes(user.email)
                      ? "กำลังติดตาม"
                      : "ติดตาม"}
                  </button>
                </li>
              ))}
        </ul>

        {isModalOpen && selectedUser && (
          <div className="profile-modal">
            <div className="modal-content" ref={modalRef}>
              <div className="profile-info">
                <img
                  src={selectedUser.photoURL}
                  alt={selectedUser.displayName}
                  className="profile-photo"
                />
                <h2>{selectedUser.displayName}</h2>
                <p>Email: {selectedUser.email}</p>
                <p>สถานะ: {selectedUser.isOnline ? "ออนไลน์" : "ออฟไลน์"}</p>
                <button className="close-btn" onClick={handleCloseModal}>
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </div>
    </RequireLogin>
  );
};

export default Friend;
