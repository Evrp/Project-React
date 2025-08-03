import React, { useEffect, useRef, useState } from "react";
import { TiMicrophoneOutline } from "react-icons/ti";
import { MdAttachFile } from "react-icons/md";
import { IoCameraOutline } from "react-icons/io5";
import { IoIosArrowBack, IoMdSend  } from "react-icons/io";
import { BsEmojiSmile } from "react-icons/bs";
import ProfileModal from "./ProfileModal";
import axios from "axios";

const ChatPanel = ({
  messages,
  users,
  userEmail,
  userPhoto,
  userName,
  sortedFriends,
  RoomsBar,
  getnickName,
  openchat,
  input,
  setInput,
  handleSend,
  userImage,
  setOpenchat,
  endOfMessagesRef,
  defaultProfileImage,
  setFriends,
  setJoinedRooms,
  formatChatDate,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isCom, setIscom] = useState(false);

  const handleProfileClick = (userObject) => {
    if (!userObject) return; // ป้องกันกรณี userObject เป็น null หรือ undefined
    setSelectedUser(userObject);
    setModalVisible(true);
  };
  const fetchFollowInfo = async (targetEmail) => {
    if (!targetEmail) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL
        }/api/user/${targetEmail}/follow-info`
      );
      setFollowers(res.data.followers);
      setFollowing(res.data.following);
    } catch (error) {
      console.error("Error fetching follow info:", error);
    }
  };
  useEffect(() => {
    console.log("RoomsBar", RoomsBar);
    if (!userImage) return;
    if (userImage.name) { setIscom(true); return; }
    if (userImage.usermatch) { setIscom(true); return; }
    if (userImage.email) setIscom(false);
    try {
      fetchFollowInfo(userImage.email);
    } catch (error) {
      console.error("Error fetching follow info:", error);
    }
  }, [userImage]);

  return (
    <div className={`chat-container ${openchat ? "mobile-layout-mode" : ""}`}>
      <div className={`show-info ${openchat ? "mobile-layout-mode" : ""}`}>
        <button
          className={`back-button-mobile ${openchat ? "mobile-layout-mode" : ""}`}
          onClick={() => setOpenchat(false)}
          style={{
            WebkitTapHighlightColor: 'transparent', // ลบ highlight สีฟ้าบน iOS
            userSelect: 'none' // ป้องกันการเลือกข้อความ
          }}
        >
          <IoIosArrowBack />
        </button>
        <div className="center-mobile">
          <img
            src={
              userImage && users && RoomsBar && (
                users.find((u) => u.email === userImage?.usermatch)?.photoURL ||
                users.find((u) => u.email === userImage?.email)?.photoURL ||
                RoomsBar?.photoURL ||
                userImage?.image ||
                defaultProfileImage
              )
            }
            alt="Profile"
            className={`chat-profile ${openchat ? "mobile-layout-mode" : ""}`}
            onClick={() => {
              if (!userImage || !users) return;
              const userObject =
                users.find((u) => u.email === userImage?.usermatch) ||
                users.find((u) => u.email === userImage?.email) || userImage;
              handleProfileClick(userObject);
            }}
          />
        </div>
        <h2 className={`chat-title ${openchat ? "mobile-layout-mode" : ""}`}>
          {userImage && Array.isArray(getnickName) && users && (
            getnickName.find((u) => u.email === userImage?.usermatch)
              ?.nickname ||
            getnickName.find((u) => u.email === userImage?.email)
              ?.nickname ||
            users.find((u) => u.email === userImage?.usermatch)?.displayName ||
            users.find((u) => u.email === userImage?.email)?.displayName ||
            (RoomsBar && RoomsBar.roomName) ||
            userName || "Chat"
          )}
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
                  className={`chat-message ${isCurrentUser ? "my-message" : "other-message"
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
                    className={`message-content ${isCurrentUser ? "current" : "other"
                      }`}
                  >
                    <div className="colum-message">
                      <div
                        className={`message-bubble ${isCurrentUser ? "current" : "other"
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
            {/* <TiMicrophoneOutline /> */}
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
            {/* <IoCameraOutline /> */}
            {/* <BsEmojiSmile /> */}
          </div>
          <div className="emoji-left">
            <IoMdSend 
              onClick={handleSend}
            />
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        user={selectedUser}
        isCom={isCom}
        userImage={userImage}
        setFriends={setFriends}
        sortedFriends={sortedFriends}
        followers={followers}
        setJoinedRooms={setJoinedRooms}
        following={following}
        users={users}
      />
    </div>
  );
};

export default ChatPanel;
