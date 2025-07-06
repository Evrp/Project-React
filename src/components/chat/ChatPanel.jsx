import React, { useRef } from "react";
import { TiMicrophoneOutline } from "react-icons/ti";
import { MdAttachFile } from "react-icons/md";
import { IoCameraOutline } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";

const ChatPanel = ({
  messages,
  users,
  userEmail,
  userPhoto,
  userName,
  RoomsBar,
  getnickName,
  input,
  setInput,
  handleSend,
  endOfMessagesRef,
  defaultProfileImage,
  formatChatDate,
}) => {
  return (
    <div className="chat-container">
      <div className="show-info">
        <img
          src={
            users.find((u) => u.email === userEmail)?.photoURL ||
            RoomsBar.roomImage ||
            userPhoto
          }
          alt="Profile"
          className="chat-profile"
        />
        <h2>
          {Array.isArray(getnickName) &&
            (getnickName.find((u) => u.email === userEmail)?.nickname ||
              users.find((u) => u.email === userEmail)?.displayName ||
              RoomsBar.roomName ||
              userName)}
        </h2>
      </div>
      <div className="chat-box">
        {messages.map((msg, index) => {
          const isCurrentUser = msg.sender === userEmail;
          const senderInfo = users.find(
            (user) => user.email?.toLowerCase() === msg.sender?.toLowerCase()
          );
          const messageDate = msg.timestamp?.toDate();
          const previousMessageDate =
            index > 0 ? messages[index - 1].timestamp?.toDate() : null;
          const isNewDay =
            !previousMessageDate ||
            messageDate?.toDateString() !== previousMessageDate?.toDateString();

          return (
            <React.Fragment key={msg.id}>
              {isNewDay && (
                <div className="chat-date-divider">
                  {messageDate && formatChatDate(messageDate)}
                </div>
              )}
              <div
                className={`chat-message ${
                  isCurrentUser ? "my-message" : "other-message"
                }`}
              >
                {!isCurrentUser && (
                  <img
                    src={senderInfo?.photoURL || defaultProfileImage}
                    alt="Sender"
                    className="message-avatar"
                  />
                )}
                <div
                  className={`message-content ${
                    isCurrentUser ? "current" : "other"
                  }`}
                >
                  <div className="colum-message">
                    <div
                      className={`message-bubble ${
                        isCurrentUser ? "current" : "other"
                      }`}
                    >
                      {msg.content || msg.text}
                    </div>
                    {isCurrentUser && index === messages.length - 1 && (
                      <div className="seen-status">
                        {msg.isSeen ? "Seen" : ""}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
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
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder={"Writing something..."}
            className="chat-input"
          />
          <div className="emoji">
            <MdAttachFile />
            <IoCameraOutline />
            <BsEmojiSmile />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
