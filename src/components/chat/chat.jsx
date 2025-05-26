import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase/firebase";
import { useParams } from "react-router-dom";
// import { ref, getDownloadURL } from "firebase/storage";
import RequireLogin from "../ui/RequireLogin";
import { FaSearch } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import io from "socket.io-client";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
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
  const [chatUsers, setChatUsers] = useState([]);
  const [userPhotos, setUserPhotos] = useState({});
  const [activeUser, setActiveUser] = useState(null);
  const [currentUserfollow, setCurrentUserfollow] = useState(null);
  const userEmail = localStorage.getItem("userEmail");
  const messagesRef = collection(db, "messages");
  const endOfMessagesRef = useRef(null);
  const modalRef = useRef(null); /// เพิ่ม modalRef
  const dropdownRefs = useRef({});
  const [followers, setFollowers] = useState([]);  /// เพิ่ม followers
  const [following, setFollowing] = useState([]); /// เพิ่ม following
  const [joinedRooms, setJoinedRooms] = useState([]); /// เพิ่ม joinedRooms
  const audioRef = useRef(null);
  const [friends, setFriends] = useState([]);
  const displayName = localStorage.getItem("userName");
  const photoURL = localStorage.getItem("userPhoto");
  const [openMenuFor, setOpenMenuFor] = useState(null);

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
  useEffect(() => {
    if (userEmail) {
      fetchUsersAndFriends();
    }
  }, [userEmail]);
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
    const fetchJoinedRooms = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/user-rooms", {
          params: { userEmail },
        });
        setJoinedRooms(res.data.rooms);
      } catch (err) {
        console.error("Error fetching joined rooms:", err);
      }
    };

    if (isOpencom) {
      fetchJoinedRooms();
    }
  }, [isOpencom, userEmail]);

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

      const fetchUserPhotos = async () => {
        let userPhotoURLs = {};
        for (let user of users) {
          try {
            userPhotoURLs[user] =
              "https://blog.wu.ac.th/wp-content/uploads/2023/01/8.jpg";
            // const encodedUser = encodeURIComponent(user);
            // const userPhotoRef = ref(
            //   storage,
            //   `profile_pictures/${encodedUser}.jpg`
            // );
            // const photoURL = await getDownloadURL(userPhotoRef);
            // userPhotoURLs[user] = photoURL;
          } catch (error) {
            console.error("Error fetching user photo: ", error);
            userPhotoURLs[user] =
              "https://blog.wu.ac.th/wp-content/uploads/2023/01/8.jpg";
          }
        }
        setUserPhotos(userPhotoURLs);
      };

      fetchUserPhotos();
    });
    scrollToBottom();
    return () => unsubscribe();
  }, [userName, activeUser, roomId]);

  // useEffect(() => {
  //   console.log(activeUser);
  // }, [messages, activeUser]);

  const handleSend = async () => {
    if (input.trim() === "" || !activeUser) return;

    await addDoc(messagesRef, {
      text: input,
      sender: userName || "Unknown",
      receiver: activeUser,
      roomId: roomId,
      timestamp: serverTimestamp(),
    });

    setInput("");
  };

  const filteredMessages = messages.filter((msg) => {
    const isMyMsg = msg.sender === userName && msg.receiver === activeUser;
    const isTheirMsg =
      msg.sender === activeUser && (msg.receiver === userName || !msg.receiver);
    return isMyMsg || isTheirMsg;
  });
  const filteredFriends = friends.filter((friend) =>
    friend.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );
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
                        onClick={() => setActiveUser(friend.email)}
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
                  {joinedRooms.map((room) => (
                    <li key={room.roomId}>
                      <div>
                        <strong>{room.name}</strong>
                        <p>{room.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="list-user">
            {chatUsers.length > 0 ? (
              chatUsers
                .filter((user) => user.toLowerCase().includes(searchTerm))
                .map((user, index) => (
                  <div
                    key={index}
                    className={`user-item ${user === activeUser ? "active" : ""
                      }`}
                    onClick={() => setActiveUser(user)}
                  >
                    <img
                      src={
                        userPhotos[user] ||
                        "https://blog.wu.ac.th/wp-content/uploads/2023/01/8.jpg"
                      }
                      alt="User"
                      className="user-photo"
                    />
                    <div className="bg">
                      <div className="row-name-message">
                        <span className="user-name">{user}</span>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p>No active chats</p>
            )}
          </div>
        </div>
        <div className="chat-container">
          <div className="show-info">
            <img src={userPhoto} alt="Profile" className="chat-profile" />
            <h2>{userName}</h2>
          </div>
          <div className="chat-box">
            {filteredMessages.map((msg) => {
              const isCurrentUser = msg.sender === userName;
              const senderPhoto =
                userPhotos[msg.sender] ||
                "https://blog.wu.ac.th/wp-content/uploads/2023/01/8.jpg";

              return (
                <div
                  key={msg.id}
                  className={`chat-message ${isCurrentUser ? "my-message" : "other-message"
                    }`}
                >
                  <img
                    src={senderPhoto}
                    alt="Sender"
                    className="message-photo"
                  />
                  <div className="message-bubble">{msg.text}</div>
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
      </div>
    </RequireLogin>
  );
};

export default Chat;
