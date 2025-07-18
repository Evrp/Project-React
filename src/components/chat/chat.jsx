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
import { useParams } from "react-router-dom";
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
import "../chat/ChatResponsive.css";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import ChatContainerAI from "./ChatContainerAI";

const socket = io(import.meta.env.VITE_APP_API_BASE_URL);
import { useTheme } from "../../context/themecontext";
import ListUser from "./userlist";
import CommunityList from "./communitylist";
import ChatPanel from "./ChatPanel";
import MatchList from "./matchlist";

const Chat = () => {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const [isOpencom, setIsOpencom] = useState(false);
  const [isOpenevent, setIsOpenevent] = useState(true);
  const { roomId } = useParams();
  const [users, setUsers] = useState([]);
  const userPhoto = localStorage.getItem("userPhoto");
  const userName = localStorage.getItem("userName");
  const [searchTerm, setSearchTerm] = useState("");
  const [input, setInput] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingFriendRooms, setLoadingRoomId] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [currentUserfollow, setCurrentUserfollow] = useState(null);
  const userEmail = localStorage.getItem("userEmail");
  const messagesRef = collection(db, "messages");
  const endOfMessagesRef = useRef(null);
  const dropdownRefs = useRef({});
  const [joinedRooms, setJoinedRooms] = useState([]); /// เพิ่ม joinedRooms
  const [allRooms, setRooms] = useState([]); /// เพิ่ม joinedRooms
  const [allEvents, setEvents] = useState([]); /// เพิ่ม joinedRooms
  const [friends, setFriends] = useState([]);
  const [friendsBar, setFriendsBar] = useState([]);
  const [RoomsBar, setRoomBar] = useState([]);
  const displayName = localStorage.getItem("userName");
  const photoURL = localStorage.getItem("userPhoto");
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [getnickName, getNickName] = useState("");
  const [lastMessages, setLastMessages] = useState({});
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [isOpenMatch, setIsOpenMatch] = useState(false);

  const defaultProfileImage = userPhoto;

  const fetchUsersAndFriends = async () => {
    setLoadingFriends(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/users`
      );
      const allUsers = response.data;
      setUsers(allUsers);
      const currentUser = allUsers.find((u) => u.email === userEmail);
      console.log("Current user:", currentUser);
      if (currentUser && Array.isArray(currentUser)) {
        // กรณี friends เป็น array ของ object หรือ string
        const friendEmails = currentUser.map((f) =>
          typeof f === "string" ? f : f.email
        );
        console.log("Friend emails:", friendEmails);

        // ดึงข้อมูล user ของแต่ละ friend จาก allUsers
        const filteredFriends = allUsers
          .filter((user) => friendEmails.includes(user.email))
          .map((user) => ({
        photoURL: user.photoURL,
        email: user.email,
        displayName: user.displayName,
        _id: user._id,
        isOnline: user.isOnline || false,
          }))
          .sort((a, b) => a.displayName.localeCompare(b.displayName));
        console.log("Filtered friends:", filteredFriends);
        setFriends(filteredFriends);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error("Error fetching users and friends:", error);
    } finally {
      setLoadingFriends(false);
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
        const friendArray = currentUser.friends;
        const friendEmails = friendArray.map((f) => f.email);
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
        console.log("Filtered friends:", filteredFriends);
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
  const handleProfileClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };


  const fetchJoinedRooms = async () => {
    setLoadingRooms(true);
    try {
      const encodedEmail = encodeURIComponent(userEmail);
      const res = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL
        }/api/user-rooms/${encodedEmail}`
      );
      setJoinedRooms(res.data);
    } catch (err) {
      console.error("Error fetching joined rooms:", err);
    } finally {
      setLoadingRooms(false);
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
  const getallEvents = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/events-match/${userEmail}`
      );
      setEvents(res.data);
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
    if (input.trim() === "" || (!isGroupChat && !selectedUser)) return;
    console.log(
      "Sending message:",
      input,
      "to roomId:",
      roomId,
      "activeUser:",
      activeUser
    );
    const messageData = {
      sender: userEmail,
      content: input,
      timestamp: serverTimestamp(),
      roomId: roomId,
      // receiver: activeUser,
      isSeen: false,
    };

    // เพิ่ม receiver สำหรับแชทส่วนตัว (เก็บ selectedUser)
    if (!isGroupChat && selectedUser) {
      messageData.receiver = selectedUser.email;
    }
    if (isGroupChat === true) {
      // สำหรับแชทกลุ่ม
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
    } else if (isOpenMatch) {
      fetchJoinedRooms();
      getallEvents();
    }
  }, [isOpencom, isOpenMatch, userEmail]);
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
        ? allMessages.filter(
          (msg) => msg.type === "group" && msg.roomId === roomId
        )
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

  // useEffect(() => {
  //   setLoadingMessages(true);
  //   const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
  //   const unsubscribe = onSnapshot(q, (snapshot) => {
  //     const newMessages = snapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));

  //     setMessages(newMessages); // ให้ UI ทุกส่วนอัปเดตตามนี้

  //     // อัปเดตข้อความล่าสุดของแต่ละ friend
  //     const latest = {};
  //     newMessages.forEach((msg) => {
  //       const friendEmail =
  //         msg.sender === userEmail ? msg.receiver : msg.sender;
  //       if (!latest[friendEmail]) latest[friendEmail] = msg;
  //     });

  //     setLastMessages(latest);
  //     setLoadingMessages(false);
  //   });

  //   return () => unsubscribe();
  // }, [userEmail]);
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
  return (
    <RequireLogin>
      <div className={`main-container ${isDarkMode ? "dark-mode" : ""}`}>
        <div className="user-container">
          <div className="chat">
            <h2>Chat</h2>
          </div>
          <div className="search-con">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              className="search-input-friend"
              autoFocus
            />
          </div>
          <div className="slide-chat">
            <ListUser
              sortedFriends={sortedFriends}
              lastMessages={lastMessages}
              setActiveUser={setActiveUser}
              setIsGroupChat={setIsGroupChat}
              dropdownRefs={dropdownRefs}
              getnickName={getnickName}
              setFriends={setFriends}
            />

            <CommunityList
              joinedRooms={joinedRooms}
              allRooms={allRooms}
              isOpencom={isOpencom}
              setIsOpencom={setIsOpencom}
              setActiveUser={(roomId) => {
                setActiveUser(roomId);
                setIsGroupChat(true);
              }}
              setIsGroupChat={setIsGroupChat}
              dropdownRefs={dropdownRefs}
              getnickName={getnickName}
              setFriends={setFriends}
              setRoombar={setRoombar}
              loadingFriendRooms={loadingFriendRooms}
              openMenuFor={openMenuFor}
              setJoinedRooms={setJoinedRooms}
              setOpenMenuFor={setOpenMenuFor}
            />

            <MatchList
              joinedRooms={joinedRooms}
              allEvents={allEvents}
              users={users}
              isOpenMatch={isOpenMatch}
              setIsOpenMatch={setIsOpenMatch}
              setActiveUser={setActiveUser}
              handleProfileClick={handleProfileClick}
              setRoombar={setRoombar}
              setIsGroupChat={setIsGroupChat}
              loadingFriendRooms={loadingFriendRooms}
              openMenuFor={openMenuFor}
              setOpenMenuFor={setOpenMenuFor}
              dropdownRefs={dropdownRefs}
              setJoinedRooms={setJoinedRooms}
              getnickName={getnickName}
              setFriends={setFriends}
            />
          </div>
        </div>
        <div className="bg-chat-con">
          <ChatPanel
            messages={messages}
            users={users}
            userEmail={userEmail}
            userPhoto={userPhoto}
            userName={userName}
            RoomsBar={RoomsBar}
            getnickName={getnickName}
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            endOfMessagesRef={endOfMessagesRef}
            defaultProfileImage={defaultProfileImage}
            formatChatDate={formatChatDate}
          />

          <ChatContainerAI
            loadingMessages={loadingMessages}
            messages={messages}
            users={users}
            userEmail={userEmail}
            defaultProfileImage={defaultProfileImage}
            formatChatDate={formatChatDate}
            endOfMessagesRef={endOfMessagesRef}
            input={input}
            setInput={setInput}
            handleSend={handleSend}
          />
        </div>
      </div>
    </RequireLogin>
  );
};

export default Chat;
