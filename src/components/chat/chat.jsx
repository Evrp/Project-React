import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase/firebase";
import { useParams } from "react-router-dom";
// import { ref, getDownloadURL } from "firebase/storage";
import RequireLogin from "../ui/RequireLogin";
import { FaSearch } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BsThreeDots } from "react-icons/bs";
import io from "socket.io-client";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  Timestamp
} from "firebase/firestore";
import "../chat/Chat.css";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
const socket = io("http://localhost:8080");

const Chat = () => {
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
  const [chatUsers, setChatUsers] = useState([]);
  const [userPhotos, setUserPhotos] = useState({});
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
        `http://localhost:8080/api/users/gmail/${userEmail}`
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
    const url = `http://localhost:8080/api/users/${userEmail}/${isFollowing ? "unfollow" : "follow"
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
      console.log(targetEmail);
      const res = await axios.get(
        `http://localhost:8080/api/user/${targetEmail}/follow-info`
      );

      setFollowers(res.data.followers);
      setFollowing(res.data.following);
    } catch (error) {
      console.error("Error fetching follow info:", error);
    }
  };
  const handleRoomProfileClick = (room) => {
    // เช่น เปิด modal หรือ redirect ไปหน้าโปรไฟล์ห้อง
    console.log("ดูโปรไฟล์ห้อง:", room);
  };
  const handleDeleteRoom = async (roomName) => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/delete-joined-rooms/${roomName}/${userEmail}`
      );

      // อัปเดต state ทันที
      setJoinedRooms(prev => ({
        ...prev,
        roomNames: prev.roomNames.filter(name => name !== roomName),
        roomIds: prev.roomIds.filter(id => id !== roomName) // ใช้ roomName ถ้าเก็บเป็นชื่อ
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
      console.log(res.data);
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
    console.log("roomId:", roomId);
    const q = query(messagesRef, orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // ✅ กรองเฉพาะข้อความในห้องนี้
      const roomMessages = allMessages.filter((msg) => msg.roomId === roomId);
      setMessages(roomMessages);

      // ✅ เล่นเสียงถ้ามีข้อความใหม่ที่มาจากคนอื่นส่งให้เรา
      const lastMsg = roomMessages[roomMessages.length - 1];
      if (
        lastMsg &&
        lastMsg.sender !== userName &&
        lastMsg.text &&
        lastMsg.receiver === userName
      ) {
        audioRef.current?.play().catch(() => { });
      }

      const users = new Set();
      roomMessages.forEach((msg) => {
        if (msg.sender !== userName) {
          users.add(msg.sender);
        }
      });

      const usersArray = Array.from(users);
      setChatUsers(usersArray);

      if (!activeUser && usersArray.length > 0) {
        setActiveUser(usersArray[usersArray.length - 1]);
      }
      console
      // console.log("photo", usersArray[usersArray.length - 1]);
      // console.log("photo", filteredFriends[filteredFriends.length - 1].photoURL);
      const fetchUserPhotos = async () => {
        // สร้าง object เพื่อเก็บ URL รูปโปรไฟล์
        const userPhotoURLs = {};

        // วนลูปผ่าน users เพื่อหารูปโปรไฟล์
        users.forEach(user => {
          // หาเพื่อนที่ตรงกับ user email
          const friend = filteredFriends.find(f => f.displayName === user);
          // ถ้าเจอเพื่อนและมีรูปโปรไฟล์
          if (friend && friend.photoURL) {
            userPhotoURLs[user.email] = friend.photoURL;
            console.log("photouser", userPhotoURLs[user.email]);
          } else {
            // ถ้าไม่เจอหรือไม่มีรูป ใช้รูป default
            userPhotoURLs[user.email] = "https://blog.wu.ac.th/wp-content/uploads/2023/01/8.jpg";
          }
        });

        // บันทึกรูปโปรไฟล์ทั้งหมดลง state
        setUserPhotos(filteredFriends);
      };
      fetchUserPhotos();
    });
    scrollToBottom();
    return () => unsubscribe();
  }, [userName, activeUser, roomId]);
  ////////Chat one to Many//////////
  useEffect(() => {
    if (!roomId) return;

    // 1. ดึงข้อมูลห้องจาก Firestore เพื่อตรวจสอบประเภท
    const roomRef = doc(firestore, "rooms", roomId);
    const roomUnsubscribe = onSnapshot(roomRef, (doc) => {
      const roomData = doc.data();
      setIsGroupChat(roomData?.type === "group");
    });

    // 2. ดึงข้อความ (ปรับ query สำหรับกลุ่ม)
    const messagesQuery = query(
      collection(firestore, "rooms", roomId, "messages"),
      orderBy("timestamp")
    );

    const messagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const roomMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setMessages(roomMessages);

      // เล่นเสียงเมื่อมีข้อความใหม่จากคนอื่น (เฉพาะกลุ่ม)
      const lastMsg = roomMessages[roomMessages.length - 1];
      if (lastMsg && lastMsg.sender !== userEmail) {
        audioRef.current?.play().catch(() => { });
      }

      // อัปเดตรายชื่อผู้ร่วมแชท (สำหรับกลุ่ม)
      if (isGroupChat) {
        const uniqueSenders = [...new Set(roomMessages.map(msg => msg.sender))];
        setChatUsers(uniqueSenders);
      }
    });

    return () => {
      roomUnsubscribe();
      messagesUnsubscribe();
    };
  }, [roomId, userEmail, isGroupChat]);
  ////////////////////////////////
  const handleSend = async () => {
    if (input.trim() === "" || !activeUser) return;
    console.log("input:", input);
    console.log("userEmail:", userEmail);
    console.log("activeUser:", activeUser);
    console.log("roomId:", roomId);
    console.log("serverTimestamp:", serverTimestamp());


    // สำหรับห้องกลุ่ม
    if (isGroupChat) {
      await addDoc(collection(firestore, "rooms", roomId, "messages"), {
        sender: userEmail,
        content: input,
        timestamp: serverTimestamp()
      });
    }
    // สำหรับแชทส่วนตัว
    else {
      await addDoc(messagesRef, {
        text: input,
        sender: userEmail,
        receiver: activeUser,
        timestamp: serverTimestamp()
      });
    }
    console;
    setInput("");
  };
  const filteredMessages = messages.filter((msg) => {
    const isMyMsg = msg.sender === userEmail && msg.receiver === activeUser;
    const isTheirMsg =
      msg.sender === activeUser && (msg.receiver === userEmail || !msg.receiver);
    return isMyMsg || isTheirMsg;
  });
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

  return (
    <RequireLogin>
      <div className="main-container">
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
              className="search-input"
            />
          </div>
          <div className="favorite-container">
            <div
              className="favorite-toggle"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              {isOpen ? <FaChevronDown /> : <FaChevronRight />}
              <span>Favorite</span>
            </div>
            {isOpen && (
              <div className="favorite-container">
                <ul className="friend-list-chat">
                  {filteredFriends.length > 0 ? (
                    filteredFriends.map((friend, index) => (
                      <li
                        key={index}
                        className="chat-friend-item"
                        onClick={() => {
                          setProfilebar({
                            photoURL: friend.photoURL,
                            displayName: friend.displayName
                          });
                          setActiveUser(friend.email)
                        }}
                      >
                        <img
                          src={friend.photoURL}
                          alt={friend.displayName}
                          className="friend-photo"
                        />
                        <div className="friend-detailss">
                          <span className="friend-name">
                            {friend.displayName}
                          </span>
                          <span className="friend-email">{friend.email}</span>
                        </div>
                        <div className="con-right">
                          <span
                            className={`status ${friend.isOnline ? "online" : "offline"
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
                                  disabled={loadingFriendEmail === friend.email}
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
              <div className="favorite-container">
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
                                key={room.roomId}
                                className="chat-friend-item"
                                onClick={() => {
                                  setActiveUser(room.name),
                                    setRoombar(room.image, room.name)
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
                                        disabled={loadingFriendRooms === room.name}
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
        <div className="chat-container">
          <div className="show-info">
            <img src={users.find(u => u.email === activeUser)?.photoURL || RoomsBar.roomImage || userPhoto} alt="Profile" className="chat-profile" />
            <h2>{users.find(u => u.email === activeUser)?.displayName || RoomsBar.roomName || userName}</h2>
          </div>
          <div className="chat-box">
            {filteredMessages.map((msg) => {
              const isCurrentUser = msg.sender === userEmail;
              const senderInfo = users.find(user => user.email?.toLowerCase() === msg.sender?.toLowerCase());
              const messageDate = msg.timestamp?.toDate();

              return (
                <div
                  key={msg.id}
                  className={`chat-message ${isCurrentUser ? "my-message" : "other-message"}`}                >
                  {!isCurrentUser && (
                    <img
                      src={senderInfo?.photoURL || defaultProfileImage}
                      alt="Sender"
                      className="message-avatar"
                    />
                  )}

                  <div className="message-content">
                    <div className="message-time">
                      {messageDate && messageDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className={`message-bubble ${isCurrentUser ? 'current' : 'other'}`}>
                      {msg.text}

                    </div>

                  </div>

                  {isCurrentUser && (
                    <img
                      src={userPhoto || defaultProfileImage}
                      alt="You"
                      className="message-avatar"
                    />
                  )}
                </div>
              );
            })}

            <div ref={endOfMessagesRef} />
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="chat-input"
            />
            <button onClick={handleSend} className="chat-send-button">
              Send
            </button>
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
                  alt={selectedUser.displayName}
                  className="profile-photo"
                />
                <h2>{selectedUser.displayName}</h2>
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
    </RequireLogin >
  );
};

export default Chat;
