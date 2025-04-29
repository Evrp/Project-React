import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebase/firebase";
import { ref, getDownloadURL } from "firebase/storage";
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
  const userPhoto = localStorage.getItem("userPhoto");
  const userName = localStorage.getItem("userName");

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [userPhotos, setUserPhotos] = useState({});
  const [activeUser, setActiveUser] = useState(null);

  const messagesRef = collection(db, "messages");

  useEffect(() => {
    const q = query(messagesRef, orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(messagesData);

      const users = new Set();
      messagesData.forEach((msg) => {
        if (msg.sender !== userName) {
          users.add(msg.sender);
        }
      });

      const usersArray = Array.from(users);
      setChatUsers(usersArray);

      // ตั้งค่า activeUser เป็นคนล่าสุดที่คุยด้วย
      if (!activeUser && usersArray.length > 0) {
        setActiveUser(usersArray[usersArray.length - 1]);
      }

      // โหลดรูปโปรไฟล์ของผู้ใช้
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
  }, [userName, activeUser]);

  const handleSend = async () => {
    if (input.trim() === "" || !activeUser) return;

    await addDoc(messagesRef, {
      text: input,
      sender: userName || "Unknown",
      receiver: activeUser,
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
