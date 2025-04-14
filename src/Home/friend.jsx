import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./friend.css";

const socket = io("http://localhost:8080");

const Friend = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // ใช้สำหรับกรองข้อมูล

  useEffect(() => {
    // ดึงข้อมูลผู้ใช้งานทั้งหมดจาก API
    axios
      .get("http://localhost:8080/api/users")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });

    // แจ้ง server ว่า user ออนไลน์
    const displayName = localStorage.getItem("userName");
    const photoURL = localStorage.getItem("userPhoto");
    const email = localStorage.getItem("userEmail");
    socket.emit("user-online", { displayName, photoURL, email });

    // รับข้อมูลสถานะออนไลน์จาก server
    socket.on("update-users", (onlineUsers) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => ({
          ...user,
          isOnline: onlineUsers.includes(user.email), // อัปเดตสถานะออนไลน์
        }))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ฟังก์ชันค้นหา
  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  return (
    <div className="fr-container">
      <h1 className="Freind">เพื่อนทั้งหมด</h1>

      <input
        type="text"
        placeholder="ค้นหาชื่อเพื่อน..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />

      <ul className="friend-list">
        {users
          .filter((user) =>
            user.displayName.toLowerCase().includes(searchTerm)
          )
          .map((u, i) => (
            <li key={i} className="friend-item">
              <img
                src={u.photoURL}
                alt={u.displayName}
                className="friend-photo"
              />
              <span className="friend-name">{u.displayName}</span>
              <span
                className={`status ${u.isOnline ? "online" : "offline"}`}
              >
                {u.isOnline ? "ออนไลน์" : "ออฟไลน์"}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Friend;
