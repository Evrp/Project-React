import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase/firebase";
// import { ref, getDownloadURL } from "firebase/storage";
import RequireLogin from "../ui/RequireLogin";
import { FaSearch } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { TiMicrophoneOutline } from "react-icons/ti";
import "react-toastify/dist/ReactToastify.css";
import { BsThreeDots } from "react-icons/bs";
import { MdAttachFile } from "react-icons/md";
import { IoCameraOutline } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import { useParams, useLocation } from "react-router-dom";
import io from "socket.io-client";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  query,
  orderBy,
  getDocs,
  doc,
  where,
} from "firebase/firestore";
import "../chat/Chat.css";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
const socket = io(import.meta.env.VITE_APP_API_BASE_URL);
import { useTheme } from "../../context/themecontext";
import ListUser from "./userlist";
import CommunityList from "./communitylist";

const Chat = () => {
  const { isDarkMode } = useTheme();
  const { roomId } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("friend"); // friend | room | ai
  const [activeFriend, setActiveFriend] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeRoomId, setActiveRoomId] = useState(roomId || null);
  const [messages, setMessages] = useState([]);
  const [aiMessages, setAiMessages] = useState([]);
  const [input, setInput] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [allRooms, setRooms] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastMessages, setLastMessages] = useState({});
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [loadingFriendRooms, setLoadingRoomId] = useState(null);
  const [getnickName, getNickName] = useState("");
  const [RoomsBar, setRoomBar] = useState([]);
  const [friendsBar, setFriendsBar] = useState([]);
  const dropdownRefs = useRef({});
  const endOfMessagesRef = useRef(null);
  const userEmail = localStorage.getItem("userEmail");
  const userPhoto = localStorage.getItem("userPhoto");
  const userName = localStorage.getItem("userName");
  const displayName = userName;
  const photoURL = userPhoto;
  const messagesRef = collection(db, "messages");

  const fetchUsersAndFriends = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/users`
      );
      const allUsers = response.data;
      setUsers(allUsers);

      const currentUser = allUsers.find((u) => u.email === userEmail);
      if (currentUser && Array.isArray(currentUser.friends)) {
        const friendEmails = currentUser.friends.map((f) =>
          typeof f === "string" ? f : f.email
        );
        const filteredFriends = allUsers
          .filter((user) => friendEmails.includes(user.email))
          .map((user) => ({
            photoURL: user.photoURL,
            email: user.email,
            displayName: user.displayName,
            isOnline: user.isOnline || false,
          }))
          .sort((a, b) => a.displayName.localeCompare(b.displayName));

        setFriends(filteredFriends);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error("Error fetching users and friends:", error);
    }
  };

  const fetchCurrentUserAndFriends = async () => {
    try {
      const encodedEmail = encodeURIComponent(userEmail);
      const userRes = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/users/${encodedEmail}`
      );
      const currentUser = userRes.data;

      if (Array.isArray(currentUser.friends)) {
        const friendEmails = currentUser.friends;

        // ดึง users ทั้งหมดมาเพื่อจับคู่กับ friend emails
        const allUsersRes = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/api/users`
        );
        const allUsers = allUsersRes.data;

        const filteredFriends = allUsers
          .filter((user) => friendEmails.includes(user.email))
          .map((user) => ({
            photoURL: user.photoURL,
            email: user.email,
            displayName: user.displayName,
            isOnline: user.isOnline || false,
          }))
          .sort((a, b) => a.displayName.localeCompare(b.displayName));
        setFriends(filteredFriends);
        setUsers(allUsers);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error("Error fetching current user or friends:", error);
    }
  };
  const fetchGmailUser = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/users/${userEmail}`
      );
      setCurrentUserfollow(res.data);
    } catch (err) {
      console.error("โหลด Gmail currentUser ไม่ได้:", err);
    }
  };

  const fetchJoinedRooms = async () => {
    try {
      const encodedEmail = encodeURIComponent(userEmail);
      const res = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/api/user-rooms/${encodedEmail}`
      );
      setJoinedRooms(res.data);
    } catch (err) {
      console.error("Error fetching joined rooms:", err);
    }
  };
  const getallRooms = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/allrooms`
      );
      setRooms(res.data);
    } catch (err) {
      console.error("Error joining room:", err);
    }
  };
  const scrollToBottom = () => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleSend = async () => {
    if (input.trim() === "") return;
    if (activeTab === "ai") return;
    const messageData = {
      sender: userEmail,
      content: input,
      timestamp: serverTimestamp(),
      roomId: activeRoomId,
      isSeen: false,
    };
    if (activeTab === "friend" && activeFriend) {
      messageData.receiver = activeFriend;
    }
    if (activeTab === "room" && activeRoom) {
      messageData.type = "group";
      messageData.receiver = null;
    }
    await addDoc(messagesRef, messageData);
    setInput("");
  };
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return "เมื่อสักครู่";
    if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
    if (diffHour < 24) return `${diffHour} ชม.ที่แล้ว`;

    return timestamp.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const formatChatDate = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays <= 7) {
      // แสดงชื่อวันแบบย่อและเวลา (เช่น Mon 22:46)
      return date.toLocaleString("en-GB", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else {
      // แสดงวัน เดือน ปี ค.ศ. และเวลา
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short", // Jan, Feb, ...
        year: "numeric", // 2025
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  };
  const getLastMessage = (email) => {
    const friendMessages = messages
      .filter(
        (msg) =>
          (msg.sender === email && msg.receiver === userEmail) ||
          (msg.sender === userEmail && msg.receiver === email)
      )
      .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds); // ใหม่สุดก่อน

    return friendMessages[0];
  };
  const setProfilebar = (displayName) => {
    setFriendsBar({ displayName });
  };
  const setRoombar = (roomImage, roomName) => {
    setRoomBar({ roomImage, roomName });
  };
  const handleSendToAI = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiMessages((prev) => [...prev, { sender: "user", text: aiInput }]);
    setAiInput("");
    try {
      // สมมุติ API ตอบกลับ { text: "..." }
      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/ai-chat`,
        { prompt: aiInput }
      );
      setAiMessages((prev) => [...prev, { sender: "ai", text: res.data.text }]);
    } catch (err) {
      setAiMessages((prev) => [...prev, { sender: "ai", text: "ขออภัย เกิดข้อผิดพลาด" }]);
    }
    setAiLoading(false);
  };

  const handleClearAIChat = () => setAiMessages([]);

  useEffect(() => {
    fetchUsersAndFriends();
  }, []);
  useEffect(() => {
    if (!userEmail) return;

    fetchCurrentUserAndFriends();
    socket.emit("user-online", { displayName, photoURL, email: userEmail });

    socket.on("update-users", (onlineUsers) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => ({
          ...user,
          isOnline: onlineUsers.includes(user.email),
        }))
      );
      setFriends((prevFriends) =>
        prevFriends.map((friend) => ({
          ...friend,
          isOnline: onlineUsers.includes(friend.email),
        }))
      );
    });

    return () => {
      socket.off("update-users");
    };
  }, [userEmail]);
  useEffect(() => {
    fetchGmailUser();
  }, []);

  useEffect(() => {
    if (isOpencom) {
      fetchJoinedRooms();
      getallRooms();
    }
  }, [isOpencom, userEmail]);
  /////////Chat One To One//////////
  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(db, "messages", roomId);
    const roomUnsubscribe = onSnapshot(roomRef, (doc) => {
      const data = doc.data();

      setIsGroupChat(isGroupChat == true);
    });

    const q = query(messagesRef, orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((msg) => msg.roomId === roomId); // กรองเฉพาะข้อความในห้องนี้

      const filteredMessages = isGroupChat
        ? allMessages.filter((msg) => {
            const isMyMsg = msg.receiver === activeUser;
            return isMyMsg;
          })
        : allMessages.filter((msg) => {
            const isMyMsg =
              msg.sender === userEmail && msg.receiver === activeUser;
            const isTheirMsg =
              msg.sender === activeUser &&
              (msg.receiver === userEmail || !msg.receiver);
            return isMyMsg || isTheirMsg;
          });

      setMessages(filteredMessages);
      scrollToBottom();
    });

    return () => {
      unsubscribe();
      roomUnsubscribe();
    };
  }, [roomId, userEmail, isGroupChat, activeUser]);

  useEffect(() => {
    const markMessagesAsSeen = async () => {
      const q = query(
        collection(db, "messages"),
        where("roomId", "==", roomId),
        where("isSeen", "==", false)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (docSnap) => {
        const msg = docSnap.data();

        // เงื่อนไข: ถ้าเป็นข้อความที่ไม่ใช่ของเรา และเราคือคนรับ
        const isNotMyMsg = msg.sender !== userEmail;
        const isMyReceiver = !msg.receiver || msg.receiver === userEmail;

        if (isNotMyMsg && isMyReceiver) {
          await updateDoc(doc(db, "messages", docSnap.id), {
            isSeen: true,
          });
        }
      });
    };
    if (messages.length > 0) {
      markMessagesAsSeen();
    }
  }, [messages, userEmail, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const getNickNameF = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/api/get-all-nicknames`
        );
        getNickName(res.data);
      } catch (err) {
        console.error("โหลด nickname ล้มเหลว:", err);
      }
    };
    getNickNameF();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(newMessages); // ให้ UI ทุกส่วนอัปเดตตามนี้

      // อัปเดตข้อความล่าสุดของแต่ละ friend
      const latest = {};
      newMessages.forEach((msg) => {
        const friendEmail =
          msg.sender === userEmail ? msg.receiver : msg.sender;
        if (!latest[friendEmail]) latest[friendEmail] = msg;
      });

      setLastMessages(latest);
    });

    return () => unsubscribe();
  }, [userEmail]);
  /////////////เรียงข้อความตามเวลา///////////////
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // เก็บข้อความล่าสุดของแต่ละคู่
      const latest = {};
      newMessages.forEach((msg) => {
        const isMyMessage = msg.sender === userEmail;
        const otherEmail = isMyMessage ? msg.receiver : msg.sender;

        // ใช้เฉพาะข้อความที่เกี่ยวกับ user
        if (
          msg.sender === userEmail ||
          msg.receiver === userEmail ||
          msg.receiver === null
        ) {
          if (!latest[otherEmail]) {
            latest[otherEmail] = msg;
          }
        }
      });

      setLastMessages(latest);
    });

    return () => unsubscribe();
  }, [userEmail]);
  const sortedFriends = [...friends].sort((a, b) => {
    const timeA = lastMessages[a.email]?.timestamp?.toDate()?.getTime() || 0;
    const timeB = lastMessages[b.email]?.timestamp?.toDate()?.getTime() || 0;
    return timeB - timeA; // เรียงจากใหม่ -> เก่า
  });

  // ดึง state ที่ส่งมาจากการ navigate (เช่น join friend/room)
  useEffect(() => {
    if (location.state) {
      if (location.state.joinedUser) {
        setActiveUser(location.state.joinedUser);
        setIsGroupChat(false);
      } else if (location.state.joinedRoom) {
        setActiveUser(location.state.joinedRoom);
        setIsGroupChat(true);
      }
    }
  }, [location.state]);

  // Tab switch handler
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setInput("");
    if (tab === "ai") setAiInput("");
  };

  // Friend chat: set active friend and roomId
  const handleSelectFriend = (friendEmail) => {
    setActiveTab("friend");
    setActiveFriend(friendEmail);
    setIsGroupChat(false);
    const emails = [userEmail, friendEmail].sort();
    setActiveRoomId(`room__${emails[0]}__${emails[1]}`);
  };

  // Room chat: set active room and roomId
  const handleSelectRoom = (roomName) => {
    setActiveTab("room");
    setActiveRoom(roomName);
    setIsGroupChat(true);
    setActiveRoomId(roomName); // สมมุติใช้ roomName เป็น roomId
  };

  // AI chat: just switch tab
  const handleSelectAI = () => {
    setActiveTab("ai");
  };

  // Filter messages by activeRoomId
  useEffect(() => {
    if (!activeRoomId || activeTab === "ai") {
      setMessages([]);
      return;
    }
    const q = query(messagesRef, orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((msg) => msg.roomId === activeRoomId);
      setMessages(allMessages);
      scrollToBottom();
    });
    return () => unsubscribe();
  }, [activeRoomId, activeTab]);

  return (
    <RequireLogin>
      <div className={`main-container ${isDarkMode ? "dark-mode" : ""}`}>
        <div className="user-container">
          <div className="chat">
            <h2>Chat</h2>
          </div>
          <div className="tab-bar">
            <button onClick={() => handleTabSwitch("friend")}
              className={activeTab === "friend" ? "active" : ""}>เพื่อน</button>
            <button onClick={() => handleTabSwitch("room")}
              className={activeTab === "room" ? "active" : ""}>ห้อง</button>
            <button onClick={handleSelectAI}
              className={activeTab === "ai" ? "active" : ""}>AI</button>
          </div>
          <div className="search-con">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              className="search-input-friend"
            />
          </div>
          <div className="slide-chat">
            {activeTab === "friend" && (
              <ListUser
                sortedFriends={friends}
                lastMessages={lastMessages}
                setActiveUser={handleSelectFriend}
                setIsGroupChat={setIsGroupChat}
                dropdownRefs={dropdownRefs}
                getnickName={getNickName}
                setFriends={setFriends}
                setActiveRoomId={setActiveRoomId}
              />
            )}
            {activeTab === "room" && (
              <CommunityList
                joinedRooms={joinedRooms}
                allRooms={allRooms}
                setActiveUser={handleSelectRoom}
                setIsGroupChat={setIsGroupChat}
                dropdownRefs={dropdownRefs}
                getnickName={getNickName}
                setFriends={setFriends}
                setRoombar={setRoomBar}
                loadingFriendRooms={loadingFriendRooms}
                openMenuFor={openMenuFor}
                setJoinedRooms={setJoinedRooms}
                setOpenMenuFor={setOpenMenuFor}
              />
            )}
          </div>
        </div>
        <div className="bg-chat-con">
          {activeTab !== "ai" && (
            <div className="chat-container">
              <div className="show-info">
                <img
                  src={
                    activeTab === "friend"
                      ? users.find((u) => u.email === activeFriend)?.photoURL || userPhoto
                      : RoomsBar.roomImage || userPhoto
                  }
                  alt="Profile"
                  className="chat-profile"
                />
                <h2>
                  {activeTab === "friend"
                    ? (Array.isArray(getnickName) && getnickName.find((u) => u.email === activeFriend)?.nickname) ||
                      users.find((u) => u.email === activeFriend)?.displayName || userName
                    : RoomsBar.roomName || "Room"}
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
                      <div className={`chat-message ${isCurrentUser ? "my-message" : "other-message"}`}>
                        {!isCurrentUser && (
                          <img
                            src={senderInfo?.photoURL || userPhoto}
                            alt="Sender"
                            className="message-avatar"
                          />
                        )}
                        <div className={`message-content ${isCurrentUser ? "current" : "other"}`}>
                          <div className="colum-message">
                            <div className={`message-bubble ${isCurrentUser ? "current" : "other"}`}>
                              {msg.content || msg.text}
                            </div>
                            {isCurrentUser && index === messages.length - 1 && (
                              <div className="seen-status">{msg.isSeen ? "Seen" : ""}</div>
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
          )}
          {activeTab === "ai" && (
            <div className="chat-container-ai">
              <div className="header-chat-ai">
                <h1>AI Chat</h1>
              </div>
              <div className="chat-box ai-chat-box">
                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`ai-message ${msg.sender === "user" ? "ai-user" : "ai-bot"}`}
                  >
                    {msg.text}
                  </div>
                ))}
                {aiLoading && <div className="ai-message ai-bot">กำลังคิด...</div>}
              </div>
              <div className="chat-input-container ai-input-container">
                <div className="chat-border ai-chat-border">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendToAI()}
                    placeholder="ถาม AI..."
                    className="chat-input ai-input"
                    disabled={aiLoading}
                  />
                  <button
                    className="ai-send-btn"
                    onClick={handleSendToAI}
                    disabled={aiLoading || !aiInput.trim()}
                  >
                    ส่ง
                  </button>
                  <button
                    className="ai-clear-btn"
                    onClick={handleClearAIChat}
                    disabled={aiMessages.length === 0}
                  >
                    ล้าง
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </div>
    </RequireLogin>
  );
};

export default Chat;
