import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { useChatStore } from "../../lib/chatSrore";
import { useUserStore } from "../../lib/userStore";
import { onSnapshot, doc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { v4 as uuid } from "uuid";

const Chat = () => {
  const { chatId } = useChatStore();
  const { currentUser } = useUserStore();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      res.exists() && setMessages(res.data().messages);
    });
    return () => unSub();
  }, [chatId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text) return;

    await updateDoc(doc(db, "chats", chatId), {
      messages: arrayUnion({
        id: uuid(),
        text,
        senderId: currentUser.id,
        date: Timestamp.now()
      }),
    });

    setText("");
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className={`message ${m.senderId === currentUser.id ? "own" : ""}`}>
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend}>
        <input 
          type="text"
          placeholder="พิมพ์ข้อความ..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">ส่ง</button>
      </form>
    </div>
  );
};

export default Chat;
