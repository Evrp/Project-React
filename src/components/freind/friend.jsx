import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./friend.css";
import { IoMdPersonAdd } from "react-icons/io";

const socket = io("http://localhost:8080");

const Friend = () => {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingFriendEmail, setLoadingFriendEmail] = useState(null);
  const modalRef = useRef(null);

  const userEmail = localStorage.getItem("userEmail");
  const displayName = localStorage.getItem("userName");
  const photoURL = localStorage.getItem("userPhoto");

  const fetchUsersAndFriends = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/users");
      const allUsers = response.data;
      setUsers(allUsers);

      const currentUser = allUsers.find((u) => u.email === userEmail);
      if (currentUser && Array.isArray(currentUser.friends)) {
        const friendEmails = currentUser.friends.map((f) =>
          typeof f === "string" ? f : f.email
        );
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
      console.error("Error fetching users and friends:", error);
    }
  };

  useEffect(() => {
    if (!userEmail) return;

    fetchUsersAndFriends();
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
      await axios.delete("http://localhost:8080/api/remove-friend", {
        data: { userEmail, friendEmail },
      });

      setFriends((prev) =>
        prev.filter((friend) => friend.email !== friendEmail)
      );
      toast.success("ลบเพื่อนสำเร็จ!");
      handleCloseModal();
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("ไม่สามารถลบเพื่อนได้");
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

  return (
    <div className="fr-container">
      <h1 className="Friend">Friend</h1>

      <input
        type="text"
        placeholder="ค้นหาชื่อเพื่อน..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />

      <h2>เพื่อนทั้งหมด</h2>
      <ul className="friend-list">
        {friends.length > 0 ? (
          friends
            .filter((friend) =>
              friend.displayName.toLowerCase().includes(searchTerm)
            )
            .map((friend, index) => (
              <li key={index} className="friend-item">
                <img
                  src={friend.photoURL}
                  alt={friend.displayName}
                  className="friend-photo"
                />
                <div className="friend-details">
                  <span className="friend-name">{friend.displayName}</span>
                  <span className="friend-email">{friend.email}</span>
                </div>
                <span
                  className={`status ${friend.isOnline ? "online" : "offline"}`}
                >
                  {friend.isOnline ? "ออนไลน์" : "ออฟไลน์"}
                </span>
                <button
                  className="profile-btn"
                  onClick={() => handleProfileClick(friend)}
                >
                  ดูโปรไฟล์
                </button>
                <button
                  className="remove-friend-btn"
                  onClick={() => handleRemoveFriend(friend.email)}
                  disabled={loadingFriendEmail === friend.email}
                >
                  {loadingFriendEmail === friend.email
                    ? "กำลังลบ..."
                    : "ลบเพื่อน"}
                </button>
              </li>
            ))
        ) : (
          <p>คุณยังไม่มีเพื่อน</p>
        )}
      </ul>

      <h2>แนะนำ</h2>
      <ul className="friend-recommend">
        {filteredUsers
          .filter((user) => !isFriend(user.email))
          .map((user, index) => (
            <li
              key={index}
              className="friend-item clickable"
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
                  className={`status ${user.isOnline ? "online" : "offline"}`}
                >
                  {user.isOnline ? "ออนไลน์" : "ออฟไลน์"}
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
  );
};

export default Friend;
