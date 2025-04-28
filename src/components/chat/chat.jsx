import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebase/firebase"; // นำเข้า Firebase Storage
import { ref, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import "../chat/Chat.css"; // นำเข้าไฟล์ CSS ที่สร้างขึ้น

const Chat = () => {
  const userPhoto = localStorage.getItem("userPhoto");
  const userName = localStorage.getItem("userName");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatUsers, setChatUsers] = useState([]); // เก็บผู้ที่กำลังคุยด้วย
  const [userPhotos, setUserPhotos] = useState({}); // เก็บ URL ของรูปภาพผู้ใช้

  const messagesRef = collection(db, "messages"); // ชื่อ collection ชื่อ "messages"

  useEffect(() => {
    const q = query(messagesRef, orderBy("timestamp")); // เรียงตามเวลาที่ส่ง

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(messagesData);

      // สร้างรายการผู้ที่กำลังคุยจากข้อความ
      const users = new Set();
      messagesData.forEach((msg) => {
        if (msg.sender !== userName) {
          users.add(msg.sender);
        }
      });
      setChatUsers(Array.from(users));

      // ดึงรูปโปรไฟล์จาก Firebase Storage สำหรับผู้ที่กำลังคุย
      const fetchUserPhotos = async () => {
        let userPhotoURLs = {};
        for (let user of users) {
          try {
            const encodedUser = encodeURIComponent(user); // แก้ตรงนี้ เพิ่ม encode
            const userPhotoRef = ref(storage, `profile_pictures/${encodedUser}.jpg`);
            const photoURL = await getDownloadURL(userPhotoRef);
            userPhotoURLs[user] = photoURL;
          } catch (error) {
            console.error("Error fetching user photo: ", error);
            userPhotoURLs[user] = "https://blog.wu.ac.th/wp-content/uploads/2023/01/8.jpg"; // fallback
          }
        }
        setUserPhotos(userPhotoURLs);
      };
      

      // fetchUserPhotos();
    });

    return () => unsubscribe();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "") return;

    await addDoc(messagesRef, {
      text: input,
      sender: userName || "Unknown",
      timestamp: serverTimestamp(), // บันทึกเวลา
    });

    setInput("");
  };

  return (
    <div className="main-container">
      <div className="user-container">
        <div className="chat">
          <h2>Chat</h2>
        </div>
        <div className="list-user">
          {chatUsers.length > 0 ? (
            chatUsers.map((user, index) => (
              <div key={index} className="user-item">
                <img
                  src={
                    // userPhotos[user] ||
                    "https://blog.wu.ac.th/wp-content/uploads/2023/01/8.jpg"
                  }
                  alt="User"
                  className="user-photo"
                />
                <div className="bg">
                  <div className="row-name-message">
                    <span className="user-name">{user}</span>
                    <div className="last-message">
                      <p>{user.lastMessage || "No messages yet"}</p>
                    </div>
                  </div>
                  <div className="last-message-time">
                    <p>
                      {user.lastMessageTime
                        ? `Last active: ${new Date(
                            user.lastMessageTime.seconds * 1000
                          ).toLocaleString()}`
                        : "No activity"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No active chats</p>
          )}
        </div>
      </div>
      <div className="chat-container">
        <div className="show-info">
          <img src={userPhoto} alt="Profile" className="chat-profile" />
          <h2>{userName}</h2>
        </div>
        <div className="chat-box">
          {messages.map((msg) => {
            const isCurrentUser = msg.sender === userName;
            const senderPhoto =
              userPhotos[msg.sender] ||
              "https://blog.wu.ac.th/wp-content/uploads/2023/01/8.jpg";

            return (
              <div
                key={msg.id}
                className={`chat-message ${
                  isCurrentUser ? "my-message" : "other-message"
                }`}
              >
                {/* รูปโปรไฟล์ */}
                <img src={senderPhoto} alt="Sender" className="message-photo" />

                {/* ข้อความ */}
                <div className="message-bubble">{msg.text}</div>
              </div>
            );
          })}
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
          />
          <button onClick={handleSend} className="chat-send-button">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
