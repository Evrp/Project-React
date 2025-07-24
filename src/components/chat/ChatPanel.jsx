import React, { useEffect, useRef, useState } from "react";
import { TiMicrophoneOutline } from "react-icons/ti";
import { MdAttachFile } from "react-icons/md";
import { IoCameraOutline } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import ProfileModal from "./ProfileModal";

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
  userImage,
  endOfMessagesRef,
  defaultProfileImage,
  setFriends,
  formatChatDate,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleProfileClick = (userObject) => {
    setSelectedUser(userObject);
    setModalVisible(true);
  };
  useEffect(() => {
    console.log("ChatPanel userImage:", userImage);
  }, [userImage]);
  return (
    <div className="chat-container">
      <div className="show-info">
        <img
          src={
            users.find((u) => u.email === userImage.usermatch)?.photoURL ||
            users.find((u) => u.email === userImage.email)?.photoURL ||
            userPhoto
          }
          alt="Profile"
          className="chat-profile"
          onClick={() => {
            const userObject =
              users.find((u) => u.email === userImage.usermatch) ||
              users.find((u) => u.email === userImage.email);
            handleProfileClick(userObject);
          }}
          style={{ cursor: "pointer" }}
        />
        <h2>
          {Array.isArray(getnickName) &&
            (getnickName.find((u) => u.email === userImage.usermatch)
              ?.nickname ||
              getnickName.find((u) => u.email === userImage.email)
                ?.nickname ||
              users.find((u) => u.email === userImage.usermatch)?.displayName ||
              users.find((u) => u.email === userImage.email)?.displayName ||
              RoomsBar.roomName ||
              userName)}
        </h2>
      </div>
      <div className="chat-box">
        {messages.length === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <span style={{ color: "#888", fontSize: "1.1rem" }}>
              ยังไม่มีข้อความ
            </span>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser = msg.sender === userEmail;
            const senderInfo = users.find(
              (user) => user.email?.toLowerCase() === msg.sender?.toLowerCase()
            );
            const messageDate = msg.timestamp?.toDate();
            const previousMessageDate =
              index > 0 ? messages[index - 1].timestamp?.toDate() : null;
            const isNewDay =
              !previousMessageDate ||
              messageDate?.toDateString() !==
                previousMessageDate?.toDateString();

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
                      onClick={() => handleProfileClick(senderInfo)}
                      style={{ cursor: "pointer" }}
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
          })
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

      {/* Profile Modal */}
      <ProfileModal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        user={selectedUser}
        userImage={userImage}
        setFriends={setFriends}
      />
    </div>
  );
};

export default ChatPanel;
