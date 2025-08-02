
import React, { useState, useRef, useEffect } from "react";
import { ImSpinner2 } from "react-icons/im";
import { TiMicrophoneOutline } from "react-icons/ti";
import { MdAttachFile, MdSend } from "react-icons/md";
import { IoCameraOutline } from "react-icons/io5";
import { BsEmojiSmile, BsRobot } from "react-icons/bs";
import { RiRobot2Fill } from "react-icons/ri";
import { sendMessageToAI } from "../../service/aiService";
import "./ChatAI.css";

// คอมโพเนนต์ AI Chatbot พร้อมใช้งาน
// วิธีใส่ API KEY: สร้างไฟล์ .env แล้วเพิ่ม VITE_OPENAI_API_KEY=your_key
// หรือแก้ใน src/service/aiService.js ตรง OPENAI_API_KEY

const ChatContainerAI = ({
  openchat,
  isAiChatOpen,
  userEmail = "user@example.com", // ใส่ email ผู้ใช้จริงถ้ามี
  defaultProfileImage = "https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff", // รูปโปรไฟล์ผู้ใช้
  aiProfileImage = "https://ui-avatars.com/api/?name=AI&background=6366f1&color=fff", // รูปโปรไฟล์ AI
}) => {
  const [messages, setMessages] = useState([]); // {text, isAI, timestamp}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef(null);
  const inputRef = useRef(null);

  // เพิ่มข้อความต้อนรับเมื่อเริ่มต้น
  useEffect(() => {
    setMessages([
      {
        text: "สวัสดี! ฉันคือ AI Assistant พร้อมช่วยเหลือคุณเกี่ยวกับการใช้งานแอพ การหาเพื่อนที่มีความสนใจคล้ายกัน และแนะนำกิจกรรมที่น่าสนใจ มีอะไรให้ช่วยไหมคะ?",
        isAI: true,
        timestamp: new Date()
      }
    ]);
  }, []);

  // Focus input field when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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

  // Format date to display in chat
  const formatMessageDate = (date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(date);
    const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());

    if (messageDay.getTime() === today.getTime()) {
      return `วันนี้ ${messageDate.getHours().toString().padStart(2, '0')}:${messageDate.getMinutes().toString().padStart(2, '0')}`;
    } else if (messageDay.getTime() === yesterday.getTime()) {
      return `เมื่อวาน ${messageDate.getHours().toString().padStart(2, '0')}:${messageDate.getMinutes().toString().padStart(2, '0')}`;
    } else {
      return `${messageDate.getDate()}/${messageDate.getMonth() + 1}/${messageDate.getFullYear()} ${messageDate.getHours().toString().padStart(2, '0')}:${messageDate.getMinutes().toString().padStart(2, '0')}`;
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(message => {
      const date = message.timestamp ? new Date(message.timestamp) : new Date();
      const dateString = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      groups[dateString].push(message);
    });
    return groups;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = {
      text: input,
      isAI: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setIsTyping(true);

    try {
      // สร้าง delay เล็กน้อยเพื่อให้ดูเป็นธรรมชาติ
      const minDelay = 700; // มิลลิวินาที
      const sendTime = Date.now();

      // ส่งข้อความและประวัติการแชทไปยัง AI
      const aiReply = await sendMessageToAI(input, chatHistory);

      // คำนวณเวลาที่ผ่านไปตั้งแต่ส่งคำขอ
      const elapsedTime = Date.now() - sendTime;

      // ถ้าใช้เวลาน้อยกว่า minDelay ให้รอเพิ่ม
      if (elapsedTime < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime));
      }

      setIsTyping(false);
      setMessages(prev => [...prev, {
        text: aiReply,
        isAI: true,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error("AI Error:", err);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        text: "เกิดข้อผิดพลาดในการเชื่อมต่อ AI กรุณาลองใหม่อีกครั้ง",
        isAI: true,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container-ai">
      {!isAiChatOpen && (
        <div className="header-chat-ai">
          <div className="chat-header">
            <h1>
              <RiRobot2Fill /> AI Assistant
              <span className="ai-status">Online</span>
            </h1>
          </div>
        </div>
      )}
      <div className="chat-box-ai">
          {messages.length === 0 && !loading && (
            <div className="empty-list">
              <RiRobot2Fill size={36} />
              <span>เริ่มต้นสนทนากับ AI Assistant</span>
              <p>ถามเกี่ยวกับแอพ กิจกรรม หรือการค้นหาเพื่อนที่มีความสนใจเดียวกันได้เลย</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-message ${msg.isAI ? "other-message" : "my-message"}`}
            >
              {msg.isAI ? (
                <img
                  src={aiProfileImage}
                  alt="AI"
                  className="message-avatar"
                />
              ) : (
                <img
                  src={defaultProfileImage}
                  alt="User"
                  className="message-avatar"
                />
              )}
              <div className={`message-content ${msg.isAI ? "other" : "current"}`}>
                <div className="colum-message">
                  {msg.isAI && <div className="message-sender">AI Assistant</div>}
                  <div className={`message-bubble ${msg.isAI ? "other" : "current"}`}>
                    {msg.text}
                  </div>
                  {msg.timestamp && (
                    <div className="message-time">
                      {formatMessageDate(msg.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="chat-message other-message">
              <img
                src={aiProfileImage}
                alt="AI"
                className="message-avatar"
              />
              <div className="message-content other">
                <div className="colum-message">
                  <div className="message-bubble other">
                    <div className="thinking">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
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
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={loading ? "กำลังรอคำตอบ..." : "พิมพ์คำถามของคุณ..."}
              className="chat-input"
              disabled={loading}
            />
            <div className="emoji">
              <MdAttachFile />
              <BsEmojiSmile />
            </div>
            <button
              onClick={handleSend}
              className="chat-send-button"
              disabled={loading || !input.trim()}
            >
              <MdSend /> ส่ง
            </button>
          </div>
        </div>
    </div>
  );
};

export default ChatContainerAI;
