// friend.jsx
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./friend.css";

const socket = io("http://localhost:8080");

const Friend = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const displayName = localStorage.getItem("userName");
    const photoURL = localStorage.getItem("userPhoto");

    // แจ้ง server ว่า user online
    socket.emit("user-online", { displayName, photoURL });

    // รับข้อมูล user ที่ online ทั้งหมด
    socket.on("update-users", (usersOnline) => {
      setUsers(usersOnline);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1 className="Freind">Online Friends</h1>
      <ul>
        {users.map((u, i) => (
          <li key={i}>
            <img src={u.photoURL} alt={u.displayName} width="30" style={{ borderRadius: "50%" }} />
            <span style={{ marginLeft: 8 }}>{u.displayName}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Friend;
