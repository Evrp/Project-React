// Example React component showing how to use fullscreen functionality
// ตัวอย่างการใช้งานฟังก์ชันเต็มจอใน React component

import React, { useRef, useEffect } from 'react';
import { useFullscreen } from './fullscreen-utils';

const ChatWithFullscreen = () => {
  const userContainerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const chatAIContainerRef = useRef(null);
  
  // สร้าง fullscreen hooks สำหรับแต่ละ container
  const userFullscreen = useFullscreen(userContainerRef, 'user-container');
  const chatFullscreen = useFullscreen(chatContainerRef, 'chat-container');
  const chatAIFullscreen = useFullscreen(chatAIContainerRef, 'chat-container-ai');

  // Handle click events for entering fullscreen
  const handleUserContainerClick = (e) => {
    // ป้องกันการ trigger เมื่อคลิกใน search หรือ user items
    if (!e.target.closest('.search-con') && !e.target.closest('.user-item')) {
      userFullscreen.toggleFullscreen();
    }
  };

  const handleChatContainerClick = (e) => {
    // ป้องกันการ trigger เมื่อคลิกใน input หรือ messages
    if (!e.target.closest('.chat-input-container') && !e.target.closest('.chat-box')) {
      chatFullscreen.toggleFullscreen();
    }
  };

  const handleChatAIContainerClick = (e) => {
    // ป้องกันการ trigger เมื่อคลิกใน input หรือ messages
    if (!e.target.closest('.chat-input-container') && !e.target.closest('.chat-box-ai')) {
      chatAIFullscreen.toggleFullscreen();
    }
  };

  // Auto-enter fullscreen on mobile devices
  useEffect(() => {
    if (window.innerWidth <= 768) {
      // Optionally auto-enter fullscreen on mobile for better UX
      // userFullscreen.toggleFullscreen();
    }
  }, []);

  return (
    <div className="bg-chat-con">
      {/* User Container with fullscreen capability */}
      <div
        ref={userContainerRef}
        className="user-container"
        id="user-container"
        onClick={handleUserContainerClick}
        style={{ cursor: 'pointer' }}
      >
        <div className="header-chat">
          <div className="search-con">
            <input
              type="text"
              className="search-input-chat"
              placeholder="ค้นหาผู้ใช้..."
              onClick={(e) => e.stopPropagation()} // ป้องกัน fullscreen trigger
            />
          </div>
        </div>
        
        <div className="user-list">
          {/* User list items */}
          <div className="user-item" onClick={(e) => e.stopPropagation()}>
            <img src="/api/placeholder/40/40" alt="User" className="user-photo" />
            <div className="user-details">
              <h4 className="user-name">ผู้ใช้ 1</h4>
              <p className="user-status">ออนไลน์</p>
            </div>
          </div>
          {/* More user items... */}
        </div>
      </div>

      {/* Chat Container with fullscreen capability */}
      <div
        ref={chatContainerRef}
        className="chat-container"
        id="chat-container"
        onClick={handleChatContainerClick}
        style={{ cursor: 'pointer' }}
      >
        <div className="show-info">
          <h3>แชทกับ ผู้ใช้ 1</h3>
        </div>
        
        <div className="chat-box">
          {/* Chat messages */}
          <div className="chat-message my-message">
            <div className="message-bubble">สวัสดีครับ</div>
          </div>
          <div className="chat-message">
            <div className="message-bubble">สวัสดีค่ะ</div>
          </div>
        </div>
        
        <div className="chat-input-container" onClick={(e) => e.stopPropagation()}>
          <div className="chat-border">
            <input
              type="text"
              className="chat-input"
              placeholder="พิมพ์ข้อความ..."
            />
            <button className="send-button">ส่ง</button>
          </div>
        </div>
      </div>

      {/* Chat AI Container with fullscreen capability */}
      <div
        ref={chatAIContainerRef}
        className="chat-container-ai"
        id="chat-container-ai"
        onClick={handleChatAIContainerClick}
        style={{ cursor: 'pointer' }}
      >
        <div className="chat-header">
          <h1>AI Assistant</h1>
          <span className="ai-status">ออนไลน์</span>
        </div>
        
        <div className="chat-box-ai">
          {/* AI chat messages */}
          <div className="chat-message">
            <div className="message-bubble ai-message">
              สวัสดีครับ! ผมเป็น AI assistant พร้อมช่วยเหลือคุณ
            </div>
          </div>
        </div>
        
        <div className="chat-input-container" onClick={(e) => e.stopPropagation()}>
          <div className="chat-border">
            <input
              type="text"
              className="chat-input"
              placeholder="ถาม AI..."
            />
            <button className="send-button">ส่ง</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWithFullscreen;

/* 
วิธีใช้งาน:

1. Import component และ CSS files:
   import ChatWithFullscreen from './components/chat/ChatWithFullscreen';
   import './components/chat/Chat.css';
   import './components/chat/ChatAI.css';

2. ใช้ component:
   <ChatWithFullscreen />

3. คุณสมบัติ:
   - คลิกที่ user-container เพื่อเข้าสู่โหมดเต็มจอ
   - คลิกที่ chat-container เพื่อเข้าสู่โหมดเต็มจอ
   - คลิกที่ chat-container-ai เพื่อเข้าสู่โหมดเต็มจอ
   - คลิกปุ่ม × หรือพื้นที่ด้านนอกเพื่อออกจากโหมดเต็มจอ
   - รองรับการใช้งานบนมือถือ

4. การปรับแต่ง:
   - สามารถเปลี่ยนเงื่อนไขการเข้าสู่โหมดเต็มจอได้
   - สามารถเพิ่ม animation หรือ transition ได้
   - สามารถกำหนดให้เข้าโหมดเต็มจออัตโนมัติบนมือถือได้
*/
