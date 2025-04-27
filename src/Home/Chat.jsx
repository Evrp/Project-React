import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const Chat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const messagesRef = collection(db, "messages"); // 👉 ชื่อ collection ชื่อ "messages"

  useEffect(() => {
    const q = query(messagesRef, orderBy("timestamp")); // เรียงตามเวลาที่ส่ง

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (input.trim() === "") return;

    await addDoc(messagesRef, {
      text: input,
      sender: localStorage.getItem("userName") || "Unknown",
      timestamp: serverTimestamp(), // บันทึกเวลา
    });

    setInput("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Realtime Chat Room</h2>

      <div
        style={{
          border: "1px solid gray",
          height: "300px",
          overflowY: "scroll",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg) => (
          <div key={msg.id}>
            <b>{msg.sender}:</b> {msg.text}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        style={{ width: "80%", marginRight: "10px" }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default Chat;
