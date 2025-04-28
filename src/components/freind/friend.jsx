import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./friend.css";

const socket = io("http://localhost:8080");

const Friend = () => {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userEmail = localStorage.getItem("userEmail");
  const displayName = localStorage.getItem("userName");
  const photoURL = localStorage.getItem("userPhoto");

  // ฟังก์ชันที่ใช้ดึงข้อมูลเพื่อน
  const fetchFriends = async () => {
    try {
      if (selectedUser && selectedUser.friends && selectedUser.friends.length > 0) {
        console.log("selectedUser friends:", selectedUser.friends);  // ตรวจสอบค่าของ friends
        const response = await axios.get("http://localhost:8080/api/usersfriends", {
          params: { emails: JSON.stringify(selectedUser.friends) },
        });
        console.log("Fetched friends:", response.data);  // ตรวจสอบข้อมูลที่ได้รับจาก API
        setFriends(response.data);
      } else {
        setFriends([]); // ไม่มีเพื่อนให้แสดง
      }
    } catch (error) {
      console.error("Error fetching friends data:", error);
      setFriends([]); // ล้มเหลวในการดึงข้อมูลเพื่อน
    }
  };
  

  useEffect(() => {
    if (!userEmail) return; // ถ้ายังไม่มี userEmail ไม่ต้องทำอะไร

    // ดึงข้อมูลผู้ใช้งานทั้งหมด
    axios
      .get("http://localhost:8080/api/users")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });

    // แจ้ง server ว่า user ออนไลน์
    socket.emit("user-online", { displayName, photoURL, email: userEmail });

    // รับข้อมูลสถานะออนไลน์จาก server
    socket.on("update-users", (onlineUsers) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => ({
          ...user,
          isOnline: onlineUsers.includes(user.email),
        }))
      );
    });

    // Cleanup ตอนออกจากหน้า
    return () => {
      socket.off("update-users");
      socket.disconnect();
    };
  }, [userEmail]);

  useEffect(() => {
    // เมื่อ selectedUser เปลี่ยน, ดึงข้อมูลเพื่อนใหม่
    if (selectedUser) {
      fetchFriends();
    }
  }, [selectedUser]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleAddFriend = async (friendEmail) => {
    try {
      await axios.post("http://localhost:8080/api/add-friend", {
        userEmail,
        friendEmail,
      });
      fetchFriends(); // โหลดข้อมูลเพื่อนใหม่
      alert("เพื่อนถูกเพิ่มแล้ว");
    } catch (error) {
      console.error("Error adding friend:", error);
      alert("ไม่สามารถเพิ่มเพื่อนได้");
    }
  };

  const handleRemoveFriend = async (friendEmail) => {
    try {
      const response = await axios.delete(
        "http://localhost:8080/api/remove-friend",
        {
          data: { userEmail, friendEmail },
        }
      );
      console.log("Friend removed:", response.data);

      // โหลดรายชื่อเพื่อนใหม่
      fetchFriends(); // โหลดข้อมูลเพื่อนใหม่

      alert("ลบเพื่อนเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error removing friend:", error);
      alert("ไม่สามารถลบเพื่อนได้");
    }
  };

  const isFriend = (email) => {
    return friends.some((friend) => friend.friendEmail === email);
  };

  const handleProfileClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleCloseModal();
    }
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("profile-modal")) {
      handleCloseModal();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div className="fr-container">
      <h1 className="Freind">Friend</h1>

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
          friends.map((friend, i) => (
            <li key={i} className="friend-item">
              <img
                src={friend.photoURL}
                alt={friend.displayName}
                className="friend-photo"
              />
              <span className="friend-name">{friend.displayName}</span>
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
              >
                ลบเพื่อน
              </button>
            </li>
          ))
        ) : (
          <p>คุณยังไม่มีเพื่อน</p>
        )}
      </ul>

      <h2>แนะนํา</h2>
      <ul className="friend-list">
        {users
          .filter((user) => user.displayName.toLowerCase().includes(searchTerm))
          .filter((user) => !isFriend(user.email))
          .map((u, i) => (
            <li key={i} className="friend-item">
              <img
                src={u.photoURL}
                alt={u.displayName}
                className="friend-photo"
              />
              <span className="friend-name">{u.displayName}</span>
              <span className={`status ${u.isOnline ? "online" : "offline"}`}>
                {u.isOnline ? "ออนไลน์" : "ออฟไลน์"}
              </span>
              <button
                className="add-friend-btn"
                onClick={() => handleAddFriend(u.email)}
              >
                เพิ่มเพื่อน
              </button>
            </li>
          ))}
      </ul>

      {isModalOpen && selectedUser && (
        <div className="profile-modal">
          <div className="modal-content">
            <div className="profile-info">
              <img
                src={selectedUser.photoURL}
                alt={selectedUser.displayName}
                className="profile-photo"
              />
              <h2>{selectedUser.displayName}</h2>
              <p>Email: {selectedUser.email}</p>
              <p>สถานะ: {selectedUser.isOnline ? "ออนไลน์" : "ออฟไลน์"}</p>

              {/* แสดงรายชื่อเพื่อน */}
              <h3>รายชื่อเพื่อน</h3>
              <ul>
                {Array.isArray(selectedUser.friends) &&
                selectedUser.friends.length > 0 ? (
                  selectedUser.friends.map((friendEmail, index) => {
                    const friend = users.find((u) => u.email === friendEmail);
                    return friend ? (
                      <li key={index}>
                        <img
                          src={friend.photoURL}
                          alt={friend.displayName}
                          className="friend-photo"
                        />
                        <span>{friend.displayName}</span>
                      </li>
                    ) : null;
                  })
                ) : (
                  <p>ไม่มีเพื่อนในขณะนี้</p>
                )}
              </ul>

              <button className="close-btn" onClick={handleCloseModal}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Friend;
