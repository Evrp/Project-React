import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase/firebase";
import { useParams } from "react-router-dom";
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
const socket = io("http://localhost:8080");
import { useTheme } from "../ThemeContext";

const Chat = () => {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const [isOpencom, setIsOpencom] = useState(true);
  const { roomId } = useParams();
  const [users, setUsers] = useState([]);
  const userPhoto = localStorage.getItem("userPhoto");
  const userName = localStorage.getItem("userName");
  const [searchTerm, setSearchTerm] = useState("");
  const [input, setInput] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingFriendEmail, setLoadingFriendEmail] = useState(null);
  const [loadingFriendRooms, setLoadingRoomId] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [currentUserfollow, setCurrentUserfollow] = useState(null);
  const userEmail = localStorage.getItem("userEmail");
  const messagesRef = collection(db, "messages");
  const endOfMessagesRef = useRef(null);
  const modalRef = useRef(null); /// เพิ่ม modalRef
  const dropdownRefs = useRef({});
  const [followers, setFollowers] = useState([]); /// เพิ่ม followers
  const [following, setFollowing] = useState([]); /// เพิ่ม following
  const [joinedRooms, setJoinedRooms] = useState([]); /// เพิ่ม joinedRooms
  const [allRooms, setRooms] = useState([]); /// เพิ่ม joinedRooms
  const audioRef = useRef(null);
  const [friends, setFriends] = useState([]);
  const [friendsBar, setFriendsBar] = useState([]);
  const [RoomsBar, setRoomBar] = useState([]);
  const displayName = localStorage.getItem("userName");
  const photoURL = localStorage.getItem("userPhoto");
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [getnickName, getNickName] = useState("");
  const [lastMessages, setLastMessages] = useState({});
  const [darkMode, setDarkMode] = useState(false);

  const defaultProfileImage = userPhoto;

  const fetchUsersAndFriends = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/users");
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
        `http://localhost:8080/api/users/${encodedEmail}`
      );
      const currentUser = userRes.data;

      if (Array.isArray(currentUser.friends)) {
        const friendEmails = currentUser.friends;

        // ดึง users ทั้งหมดมาเพื่อจับคู่กับ friend emails
        const allUsersRes = await axios.get("http://localhost:8080/api/users");
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
  const handleRemoveFriend = async (friendEmail) => {
    try {
      setLoadingFriendEmail(friendEmail);

      await axios.delete(
        `http://localhost:8080/api/users/${userEmail}/friends/${friendEmail}`
      );

      // อัปเดตรายชื่อเพื่อนหลังจากลบ
      setFriends((prevFriends) =>
        prevFriends.filter((friend) => friend.email !== friendEmail)
      );
      toast.success("ลบเพื่อนสําเร็จ!");
    } catch (err) {
      console.error("Failed to remove friend:", err);
      alert("เกิดข้อผิดพลาดในการลบเพื่อน");
    } finally {
      setLoadingFriendEmail(null);
    }
  };
  const fetchGmailUser = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/users/${userEmail}`
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
  const handleFollow = async (targetEmail) => {
    await fetchGmailUser();
    if (!currentUserfollow || !Array.isArray(currentUserfollow.following)) {
      console.warn("currentUser ยังไม่พร้อม หรือ following ไม่มี");
      return;
    }

    const isFollowing = currentUserfollow.following.includes(targetEmail);
    const url = `http://localhost:8080/api/users/${userEmail}/${
      isFollowing ? "unfollow" : "follow"
    }/${targetEmail}`;
    const method = isFollowing ? "DELETE" : "POST";

    try {
      await axios({ method, url });
      await fetchGmailUser();
    } catch (err) {
      console.error("Follow/unfollow error:", err);
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleCloseModal();
    }
  };
  const fetchFollowInfo = async (targetEmail) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/user/${targetEmail}/follow-info`
      );

      setFollowers(res.data.followers);
      setFollowing(res.data.following);
    } catch (error) {
      console.error("Error fetching follow info:", error);
    }
  };
  // const handleRoomProfileClick = (room) => {
  //   // เช่น เปิด modal หรือ redirect ไปหน้าโปรไฟล์ห้อง
  //   console.log("ดูโปรไฟล์ห้อง:", room);
  // };
  const handleDeleteRoom = async (roomName) => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/delete-joined-rooms/${roomName}/${userEmail}`
      );

      // อัปเดต state ทันที
      setJoinedRooms((prev) => ({
        ...prev,
        roomNames: prev.roomNames.filter((name) => name !== roomName),
        roomIds: prev.roomIds.filter((id) => id !== roomName), // ใช้ roomName ถ้าเก็บเป็นชื่อ
      }));

      toast.success("ลบห้องสําเร็จ!");
    } catch (error) {
      console.error("ลบห้องล้มเหลว:", error);
      toast.error("ลบห้องล้มเหลว!");
    }
  };

  const fetchJoinedRooms = async () => {
    try {
      const encodedEmail = encodeURIComponent(userEmail);
      const res = await axios.get(
        `http://localhost:8080/api/user-rooms/${encodedEmail}`
      );
      setJoinedRooms(res.data);
    } catch (err) {
      console.error("Error fetching joined rooms:", err);
    }
  };
  const getallRooms = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/allrooms`);
      setRooms(res.data);
    } catch (err) {
      console.error("Error joining room:", err);
    }
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
    const handleClickOutside = (event) => {
      const isClickInsideAny = Object.values(dropdownRefs.current).some((ref) =>
        ref?.contains(event.target)
      );
      if (!isClickInsideAny) {
        setOpenMenuFor(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideAny = Object.values(dropdownRefs.current).some((ref) =>
        ref?.contains(event.target)
      );
      if (!isClickInsideAny) {
        setOpenMenuFor(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const scrollToBottom = () => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
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

  const handleSend = async () => {
    if (input.trim() === "" || !activeUser) return;

    const messageData = {
      sender: userEmail,
      content: input,
      timestamp: serverTimestamp(),
      roomId: roomId,
      isSeen: false,
    };

    // เพิ่ม receiver สำหรับแชทส่วนตัว
    if (!isGroupChat && activeUser) {
      messageData.receiver = activeUser;
    }
    confirm;
    if (isGroupChat == true) {
      // สำหรับแชทกลุ่ม
      messageData.type = "group";
      messageData.receiver = null;
    }

    await addDoc(messagesRef, messageData);
    setInput("");
  };

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

  const filteredFriends = friends.filter((friend) =>
    friend.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const setProfilebar = (displayName) => {
    setFriendsBar({ displayName });
  };
  const setRoombar = (roomImage, roomName) => {
    setRoomBar({ roomImage, roomName });
  };
  useEffect(() => {
    const getNickNameF = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/api/get-all-nicknames"
        );
        getNickName(res.data);
      } catch (err) {
        console.error("โหลด nickname ล้มเหลว:", err);
      }
    };
    getNickNameF();
  }, []);
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

  return (
    <RequireLogin>
      {/* <div className="main-container"> */}
      <div className={`main-container ${isDarkMode ? "dark-mode" : ""}`}>
        <div className="user-container">
          <div className="chat">
            <h2>Chat</h2>
          </div>
          <div className="search-con">
            {" "}
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
            <div className="favorite-container">
              <div
                className="favorite-toggle"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                <span>Favorite</span>
              </div>
              {isOpen && (
                <div
                  className={
                    !isOpencom && isOpen
                      ? "favorite-container-special"
                      : isOpen
                      ? "favorite-container-open"
                      : "favorite-container"
                  }
                >
                  <ul className="friend-list-chat">
                    {sortedFriends.length > 0 ? (
                      sortedFriends.map((friend, index) => (
                        <li
                          key={index}
                          className="chat-friend-item"
                          onClick={() => {
                            setProfilebar({
                              photoURL: friend.photoURL,
                              displayName: friend.displayName,
                            });
                            setActiveUser(friend.email);
                            setIsGroupChat(false);
                          }}
                        >
                          <img
                            src={friend.photoURL}
                            alt={
                              getnickName.find((n) => n.email === friend.email)
                                ?.nickname || friend.displayName
                            }
                            className="friend-photo"
                          />
                          <div className="friend-details">
                            <span className="friend-name">
                              {getnickName.find((n) => n.email === friend.email)
                                ?.nickname || friend.displayName}
                            </span>
                            <div className="row-last-time">
                              <span className="last-message">
                                {lastMessages[friend.email]?.content ||
                                  "ยังไม่มีข้อความ"}
                              </span>

                              <span className="message-time">
                                {lastMessages[friend.email]?.timestamp &&
                                  formatRelativeTime(
                                    lastMessages[
                                      friend.email
                                    ].timestamp.toDate()
                                  )}
                              </span>
                            </div>
                          </div>

                          <div className="con-right">
                            <span
                              className={`status ${
                                friend.isOnline ? "online" : "offline"
                              }`}
                            >
                              {friend.isOnline ? "ออนไลน์" : "ออฟไลน์"}
                            </span>

                            <div
                              className="dropdown-wrapper"
                              ref={(el) =>
                                (dropdownRefs.current[friend.email] = el)
                              }
                              onClick={(e) => e.stopPropagation()} // ป้องกันการเปิดแชทตอนกด dropdown
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuFor((prev) =>
                                    prev === friend.email ? null : friend.email
                                  );
                                }}
                                className="dropdown-toggle"
                              >
                                <BsThreeDots size={20} />
                              </button>

                              {openMenuFor === friend.email && (
                                <div className="dropdown-menu">
                                  <button
                                    className="dropdown-item"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleProfileClick(friend);
                                      fetchFollowInfo(friend.email);
                                      setOpenMenuFor(null);
                                    }}
                                  >
                                    👤 ดูโปรไฟล์
                                  </button>

                                  <button
                                    className="dropdown-item"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (
                                        !currentUserfollow ||
                                        !Array.isArray(
                                          currentUserfollow.following
                                        )
                                      )
                                        return;
                                      handleFollow(friend.email);
                                    }}
                                  >
                                    {Array.isArray(
                                      currentUserfollow?.following
                                    ) &&
                                    currentUserfollow.following.includes(
                                      friend.email
                                    )
                                      ? "🔔 กำลังติดตาม"
                                      : "➕ ติดตาม"}
                                  </button>

                                  <button
                                    className="dropdown-item danger"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveFriend(friend.email);
                                      setOpenMenuFor(null);
                                    }}
                                    disabled={
                                      loadingFriendEmail === friend.email
                                    }
                                  >
                                    {loadingFriendEmail === friend.email
                                      ? "กำลังลบ..."
                                      : "🗑️ ลบเพื่อน"}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <p>ไม่พบเพื่อนที่ตรงกับคำค้นหา</p>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <div className="favorite-container">
              <div
                className="favorite-toggle"
                onClick={() => setIsOpencom((prev) => !prev)}
              >
                {isOpencom ? <FaChevronDown /> : <FaChevronRight />}
                <span>Community</span>
              </div>
              {isOpencom && (
                <div
                  className={
                    !isOpen && isOpencom
                      ? "group-container-special"
                      : isOpencom
                      ? "group-container-open"
                      : "group-container"
                  }
                >
                  {" "}
                  <ul className="friend-list-chat">
                    {joinedRooms.roomNames?.map((name, index) => {
                      const roomId = joinedRooms.roomNames?.[index];

                      // ข้ามถ้า name หรือ id เป็น null
                      if (!name || !roomId) return null;

                      return (
                        <div key={roomId}>
                          {/* <h1>{name}</h1> */}
                          <ul>
                            {allRooms.map((room) =>
                              room.name === name ? (
                                <li
                                  // key={room.roomId}
                                  className="chat-friend-item"
                                  onClick={() => {
                                    setActiveUser(room.name),
                                      setRoombar(room.image, room.name);
                                    setIsGroupChat(true);
                                  }}
                                >
                                  <img
                                    src={room.image}
                                    alt={room.name}
                                    className="friend-photo"
                                  />
                                  <div className="friend-detailss">
                                    <span className="friend-name">
                                      {room.name}
                                    </span>
                                    <span className="friend-email">
                                      Host:
                                      {room.createdBy}
                                    </span>
                                  </div>
                                  <div
                                    className="dropdown-wrapper"
                                    ref={(el) =>
                                      (dropdownRefs.current[room.name] = el)
                                    }
                                    onClick={(e) => e.stopPropagation()} // ป้องกันการเปิดแชทตอนกด dropdown
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuFor((prev) =>
                                          prev === room.name ? null : room.name
                                        );
                                      }}
                                      className="dropdown-toggle"
                                    >
                                      <BsThreeDots size={20} />
                                    </button>

                                    {openMenuFor === room.name && (
                                      <div className="dropdown-menu">
                                        <button
                                          className="dropdown-item"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteRoom(room.name);
                                            setOpenMenuFor(null);
                                          }}
                                          disabled={
                                            loadingFriendRooms === room.name
                                          }
                                        >
                                          {loadingFriendRooms === room.name
                                            ? "กำลังลบ..."
                                            : "🗑️ ลบห้อง"}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </li>
                              ) : null
                            )}
                          </ul>
                        </div>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="chat-container">
          <div className="show-info">
            <img
              src={
                users.find((u) => u.email === activeUser)?.photoURL ||
                RoomsBar.roomImage ||
                userPhoto
              }
              alt="Profile"
              className="chat-profile"
            />

            <h2>
              {Array.isArray(getnickName) &&
                (getnickName.find((u) => u.email === activeUser)?.nickname ||
                  users.find((u) => u.email === activeUser)?.displayName ||
                  RoomsBar.roomName ||
                  userName)}
            </h2>
          </div>
          <div className="chat-box">
            {messages.map((msg, index) => {
              const isCurrentUser = msg.sender === userEmail;
              const senderInfo = users.find(
                (user) =>
                  user.email?.toLowerCase() === msg.sender?.toLowerCase()
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
              {/* <button onClick={handleSend} className="chat-send-button">
              Send
            </button> */}
            </div>
          </div>
        </div>

        {/* 🔊 เสียงแจ้งเตือน */}
        <audio ref={audioRef} src="/notification.mp3" preload="auto" />
        {isModalOpen && selectedUser && (
          <div className="profile-modal">
            <div className="modal-content" ref={modalRef}>
              <div className="profile-info">
                <img
                  src={selectedUser.photoURL}
                  alt={
                    getnickName.find((n) => n.email === selectedUser.email)
                      ?.nickname || selectedUser.displayName
                  }
                  className="profile-photo"
                />
                <h2>
                  {getnickName.find((n) => n.email === selectedUser.email)
                    ?.nickname || selectedUser.displayName}
                </h2>
                <div className="tabs">
                  <ul className="followers">
                    <li>{followers.length} followers</li>
                  </ul>
                  <ul className="following">
                    <li>{following.length} following</li>
                  </ul>
                </div>
                <p>Email: {selectedUser.email}</p>
                <p>สถานะ: {selectedUser.isOnline ? "ออนไลน์" : "ออฟไลน์"}</p>
                <button className="close-btn" onClick={handleCloseModal}>
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </div>
    </RequireLogin>
  );
};

export default Chat;
