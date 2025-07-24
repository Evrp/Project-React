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
import "../chat/ChatMerged.css";
import "../chat/ChatAI.css";
import "../chat/ListItems.css";
import "../chat/DropdownMenu.css";
import "../chat/OnlineStatus.css";
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
import ShowTitle from "./titlepage/showtitle";

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
  const [userImage, setUserImage] = useState({});

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
        `${
          import.meta.env.VITE_APP_API_BASE_URL
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
    // ตรวจสอบว่ามีข้อความที่จะส่งหรือไม่
    if (input.trim() === "") return;

    // ตรวจสอบว่าเป็นแชทส่วนตัวและมีผู้รับหรือไม่
    if (!isGroupChat && !selectedUser && !activeUser) {
      console.warn("ไม่สามารถส่งข้อความได้: ไม่มีผู้รับที่ระบุ");
      return;
    }

    console.log(
      "Sending message:",
      input,
      "to roomId:",
      roomId,
      "activeUser:",
      activeUser
    );

    // สร้างข้อมูลข้อความพื้นฐาน
    const messageData = {
      sender: userEmail,
      content: input,
      timestamp: serverTimestamp(),
      roomId: roomId || "direct", // ใช้ "direct" เป็นค่าเริ่มต้นถ้าไม่มี roomId
      isSeen: false,
    };

    // กำหนดผู้รับตามลำดับความสำคัญ
    if (isGroupChat === true) {
      // สำหรับแชทกลุ่ม
      messageData.type = "group";
      messageData.receiver = null; // ในกลุ่มไม่มีผู้รับเฉพาะ
    } else if (selectedUser && selectedUser.email) {
      // กรณีมี selectedUser ให้ใช้ email จาก selectedUser
      messageData.receiver = selectedUser.email;
    } else if (activeUser) {
      // ถ้าไม่มี selectedUser แต่มี activeUser ใช้ activeUser แทน
      messageData.receiver =
        typeof activeUser === "string" ? activeUser : activeUser.email;
    } else {
      console.error("ไม่สามารถส่งข้อความได้: ไม่มีผู้รับ");
      return; // ถ้าไม่มีผู้รับเลย ไม่ส่งข้อความ
    }

    try {
      await addDoc(messagesRef, messageData);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง");
    }
  };
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "";

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

  // ฟังก์ชันสำหรับแสดงสถานะออนไลน์หรือเวลาออฟไลน์ล่าสุด
  const formatOnlineStatus = (user) => {
    if (!user) return "";

    if (user.isOnline) {
      return "ออนไลน์";
    } else if (user.lastSeen) {
      const lastSeenDate = new Date(user.lastSeen);
      return `ออฟไลน์ - ${formatRelativeTime(lastSeenDate)}`;
    } else {
      return "ออฟไลน์";
    }
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

    // เมื่อเข้าสู่หน้า chat ส่งข้อมูลว่าผู้ใช้ออนไลน์
    socket.emit("user-online", { displayName, photoURL, email: userEmail });

    // ตั้งค่า ping เพื่อบอกเซิร์ฟเวอร์ว่าผู้ใช้ยังออนไลน์อยู่ ทุก 30 วินาที
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("user-ping", { email: userEmail });
      }
    }, 30000);

    // รับข้อมูลการอัปเดตสถานะผู้ใช้จากเซิร์ฟเวอร์
    socket.on("update-users", (data) => {
      // เช็คว่า data เป็น array หรือ object
      if (Array.isArray(data)) {
        setUsers((prevUsers) =>
          prevUsers.map((user) => ({
            ...user,
            isOnline: data.some(
              (onlineUser) => onlineUser.email === user.email
            ),
            lastSeen:
              data.find((onlineUser) => onlineUser.email === user.email)
                ?.lastSeen || user.lastSeen,
          }))
        );
        setFriends((prevFriends) =>
          prevFriends.map((friend) => ({
            ...friend,
            isOnline: data.some(
              (onlineUser) => onlineUser.email === friend.email
            ),
            lastSeen:
              data.find((onlineUser) => onlineUser.email === friend.email)
                ?.lastSeen || friend.lastSeen,
          }))
        );
      }
      // ถ้าข้อมูลเป็น object มี onlineUsers เป็น array
      else if (data && Array.isArray(data.onlineUsers)) {
        setUsers((prevUsers) =>
          prevUsers.map((user) => ({
            ...user,
            isOnline: user.email
              ? data.onlineUsers.includes(user.email)
              : false,
            lastSeen:
              (data.lastSeenTimes && data.lastSeenTimes[user.email]) ||
              user.lastSeen,
          }))
        );
        setFriends((prevFriends) =>
          prevFriends.map((friend) => ({
            ...friend,
            isOnline: friend.email
              ? data.onlineUsers.includes(friend.email)
              : false,
            lastSeen:
              (data.lastSeenTimes && data.lastSeenTimes[friend.email]) ||
              friend.lastSeen,
          }))
        );
      }
      // ถ้าข้อมูลเป็น string array (แบบเก่า)
      else if (Array.isArray(data)) {
        setUsers((prevUsers) =>
          prevUsers.map((user) => ({
            ...user,
            isOnline: data.includes(user.email),
            lastSeen: user.lastSeen,
          }))
        );
        setFriends((prevFriends) =>
          prevFriends.map((friend) => ({
            ...friend,
            isOnline: data.includes(friend.email),
            lastSeen: friend.lastSeen,
          }))
        );
      }
    });

    // ฟังเมื่อมีผู้ใช้ออฟไลน์
    socket.on("user-offline", (userData) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.email === userData.email
            ? { ...user, isOnline: false, lastSeen: userData.lastSeen }
            : user
        )
      );
      setFriends((prevFriends) =>
        prevFriends.map((friend) =>
          friend.email === userData.email
            ? { ...friend, isOnline: false, lastSeen: userData.lastSeen }
            : friend
        )
      );
    });

    // ฟังเมื่อมีผู้ใช้ออนไลน์
    socket.on("user-online", (userData) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.email === userData.email
            ? { ...user, isOnline: true, lastSeen: null }
            : user
        )
      );
      setFriends((prevFriends) =>
        prevFriends.map((friend) =>
          friend.email === userData.email
            ? { ...friend, isOnline: true, lastSeen: null }
            : friend
        )
      );
    });

    // เมื่อเชื่อมต่อกับเซิร์ฟเวอร์ใหม่ (reconnect)
    socket.on("connect", () => {
      // แจ้งเซิร์ฟเวอร์ว่าผู้ใช้กลับมาออนไลน์
      socket.emit("user-online", { displayName, photoURL, email: userEmail });
    });

    // Cleanup function
    return () => {
      // แจ้งเซิร์ฟเวอร์ว่าผู้ใช้ออฟไลน์เมื่อออกจากหน้า chat
      socket.emit("user-offline", { email: userEmail });
      socket.off("update-users");
      socket.off("user-offline");
      socket.off("user-online");
      socket.off("connect");
      clearInterval(pingInterval);
    };
  }, [userEmail, displayName, photoURL]);
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
              className="search-input-chat"
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
              setUserImage={setUserImage}
              setFriends={setFriends}
              formatOnlineStatus={formatOnlineStatus}
            />

            <CommunityList
              joinedRooms={joinedRooms}
              allRooms={allRooms}
              isOpencom={isOpencom}
              setUserImage={setUserImage}
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
              setUserImage={setUserImage}
            />
          </div>
        </div>
        <div className="bg-chat-con">
          <ChatPanel
            messages={messages}
            users={users}
            userEmail={userEmail}
            userPhoto={userPhoto}
            setJoinedRooms={setJoinedRooms}
            userName={userName}
            RoomsBar={RoomsBar}
            getnickName={getnickName}
            input={input}
            isOpencom={isOpencom}
            isOpenMatch={isOpenMatch}
            setFriends={setFriends}
            userImage={userImage}
            sortedFriends={sortedFriends}
            setInput={setInput}
            handleSend={handleSend}
            endOfMessagesRef={endOfMessagesRef}
            defaultProfileImage={defaultProfileImage}
            formatChatDate={formatChatDate}
          />
          <div className="tabright">
            <ShowTitle userimage={userImage} />
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
      </div>
    </RequireLogin>
  );
};

export default Chat;
