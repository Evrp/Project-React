
import React, { useState, useRef, useEffect } from "react";
import { ImSpinner2 } from "react-icons/im";
import { TiMicrophoneOutline } from "react-icons/ti";
import { MdAttachFile } from "react-icons/md";
import { IoCameraOutline } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import { sendMessageToAI } from "../../service/aiService";

// คอมโพเนนต์ AI Chatbot พร้อมใช้งาน
// วิธีใส่ API KEY: สร้างไฟล์ .env แล้วเพิ่ม VITE_OPENAI_API_KEY=your_fkey
// หรือแก้ใน src/service/aiService.js ตรง OPENAI_API_KEY

const ChatContainerAI = ({
  userEmail = "user@example.com", // ใส่ email ผู้ใช้จริงถ้ามี
  defaultProfileImage = "https://ui-avatars.com/api/?name=AI", // รูปโปรไฟล์เริ่มต้น
}) => {
  const [messages, setMessages] = useState([]); // {text, isAI}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ประวัติแชทสำหรับ AI
  const chatHistory = messages.map(msg => ({
    role: msg.isAI ? "assistant" : "user",
    content: msg.text,
  }));

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { text: input, isAI: false };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const aiReply = await sendMessageToAI(input, chatHistory);
      setMessages(prev => [...prev, { text: aiReply, isAI: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "เกิดข้อผิดพลาดในการเชื่อมต่อ AI", isAI: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container-ai">
      <div className="header-chat-ai">
        <h1>Ai Chat</h1>
        <div className="chat-box">
          {messages.length === 0 && !loading && (
            <div className="empty-list">ยังไม่มีข้อความ</div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-message ${msg.isAI ? "other-message" : "my-message"}`}
            >
              {!msg.isAI && (
                <img
                  src={defaultProfileImage}
                  alt="Sender"
                  className="message-avatar"
                />
              )}
              <div className={`message-content ${msg.isAI ? "other" : "current"}`}>
                <div className="colum-message">
                  <div className={`message-bubble ${msg.isAI ? "other" : "current"}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="loading-spinner">
              <ImSpinner2 className="spin" /> กำลังโหลดข้อความ...
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
        <div className="chat-input-container">
          <div className="chat-border">
            <div className="emoji-right">
              <TiMicrophoneOutline />
            </div>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={"Writing something..."}
              className="chat-input"
              autoFocus
              disabled={loading}
            />
            <div className="emoji">
              <MdAttachFile />
              <IoCameraOutline />
              <BsEmojiSmile />
            </div>
            <button onClick={handleSend} className="chat-send-button" disabled={loading}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContainerAI;
