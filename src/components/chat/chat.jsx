import React, { useState, useEffect, useRef } from "react";
import { db, storage } from "../../firebase/firebase";
import { useParams } from "react-router-dom";
import { ref, getDownloadURL } from "firebase/storage"; // ✅ เพิ่มกลับเข้ามา
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import "../chat/Chat.css";

const Chat = () => {
  const { roomId } = useParams();
  const userPhoto = localStorage.getItem("userPhoto");
  const userName = localStorage.getItem("userName");

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [userPhotos, setUserPhotos] = useState({});
  const [activeUser, setActiveUser] = useState(null);

  const messagesRef = collection(db, "messages");

  const endOfMessagesRef = useRef(null);
  const audioRef = useRef(null);

  const scrollToBottom = () => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const q = query(messagesRef, orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // ✅ กรองเฉพาะข้อความในห้องนี้
      const roomMessages = allMessages.filter((msg) => msg.roomId === roomId);
      setMessages(roomMessages);

      // ✅ เล่นเสียงถ้ามีข้อความใหม่ที่มาจากคนอื่นส่งให้เรา
      const lastMsg = roomMessages[roomMessages.length - 1];
      if (
        lastMsg &&
        lastMsg.sender !== userName &&
        lastMsg.text &&
        lastMsg.receiver === userName
      ) {
        audioRef.current?.play().catch(() => {});
      }

      const users = new Set();
      roomMessages.forEach((msg) => {
        if (msg.sender !== userName) {
          users.add(msg.sender);
        }
      });

      const usersArray = Array.from(users);
      setChatUsers(usersArray);

      if (!activeUser && usersArray.length > 0) {
        setActiveUser(usersArray[usersArray.length - 1]);
      }

      const fetchUserPhotos = async () => {
        let userPhotoURLs = {};
        for (let user of users) {
          try {
            const encodedUser = encodeURIComponent(user);
            const userPhotoRef = ref(storage, `profile_pictures/${encodedUser}.jpg`);
            const photoURL = await getDownloadURL(userPhotoRef);
            userPhotoURLs[user] = photoURL;
          } catch (error) {
            console.error("Error fetching user photo: ", error);
            userPhotoURLs[user] = "https://blog.wu.ac.th/wp-content/uploads/2023/01/8.jpg";
          }
        }
        setUserPhotos(userPhotoURLs);
      };

      fetchUserPhotos();
    });

    return () => unsubscribe();
  }, [userName, activeUser, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeUser]);

  const handleSend = async () => {
    if (input.trim() === "" || !activeUser) return;

    await addDoc(messagesRef, {
      text: input,
      sender: userName || "Unknown",
      receiver: activeUser,
      roomId: roomId,
      timestamp: serverTimestamp(),
    });

    setInput("");
  };

  const filteredMessages = messages.filter((msg) => {
    const isMyMsg = msg.sender === userName && msg.receiver === activeUser;
    const isTheirMsg =
      msg.sender === activeUser && (msg.receiver === userName || !msg.receiver);
    return isMyMsg || isTheirMsg;
  });

  return (
    <div className="main-container">
      <div className="user-container">
        <div className="chat">
          <h2>Chat</h2>
        </div>
        <div className="list-user">
          {chatUsers.length > 0 ? (
            chatUsers.map((user, index) => (
              <div
                key={index}
                className={`user-item ${user === activeUser ? "active" : ""}`}
                onClick={() => setActiveUser(user)}
              >
                <img
                  src={
                    userPhotos[user] ||
                    "https://blog.wu.ac.th/wp-content/uploads/2023/01/8.jpg"
                  }
                  alt="User"
                  className="user-photo"
                />
                <div className="bg">
                  <div className="row-name-message">
                    <span className="user-name">{user}</span>
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
          {filteredMessages.map((msg) => {
            const isCurrentUser = msg.sender === userName;
            const senderPhoto =
              userPhotos[msg.sender] ||
              "https://blog.wu.ac.th/wp-content/uploads/2023/01/8.jpg";

            return (
              <div
                key={msg.id}
                className={`chat-message ${isCurrentUser ? "my-message" : "other-message"}`}
              >
                <img src={senderPhoto} alt="Sender" className="message-photo" />
                <div className="message-bubble">{msg.text}</div>
              </div>
            );
          })}
          <div ref={endOfMessagesRef} />
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

      {/* 🔊 เสียงแจ้งเตือน */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
    </div>
  );
};

export default Chat;
