import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./friend.css";
import { IoMdPersonAdd } from "react-icons/io";
import RequireLogin from "../ui/RequireLogin";
import { BsThreeDots } from "react-icons/bs";
import { useTheme } from "../../context/themecontext";

const socket = io("http://localhost:8080");

const Friend = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState([]);
  const [currentUserfollow, setCurrentUserfollow] = useState(null);
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingFriendEmail, setLoadingFriendEmail] = useState(null);
  const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);
  const modalRef = useRef(null);
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [getnickName, getNickName] = useState("");
  const dropdownRefs = useRef({});
  const { isDarkMode, setIsDarkMode } = useTheme();

  const userEmail = localStorage.getItem("userEmail");
  const displayName = localStorage.getItem("userName");
  const photoURL = localStorage.getItem("userPhoto");
  useEffect(() => {
    fetchGmailUser(); // ดึงข้อมูล Gmail user จาก backend
  }, []);

  const fetchCurrentUserAndFriends = async () => {
    try {
      const encodedEmail = encodeURIComponent(userEmail);
      console.log("encodedEmail", encodedEmail);
      const userRes = await axios.get(
        `http://localhost:8080/api/users/${encodedEmail}`
      );
      const currentUser = userRes.data;
      const allUsersRes = await axios.get("http://localhost:8080/api/users");
      const allUsers = allUsersRes.data;
      console.log("allUsers", allUsers);
      console.log("currentUser", currentUser);
      setUsers(allUsers);
      if (Array.isArray(currentUser.friends)) {
        const friendEmails = currentUser.friends;
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
      console.error("Error fetching current user or friends:", error);
    }
  };

  useEffect(() => {
    if (!userEmail) return;

    fetchCurrentUserAndFriends();

    // ส่งสถานะออนไลน์
    socket.emit("user-online", {
      displayName,
      photoURL,
      email: userEmail,
    });

    // ฟังสถานะอัปเดต
    socket.on("update-users", (onlineEmails) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => ({
          ...user,
          isOnline: onlineEmails.includes(user.email),
        }))
      );
      setFriends((prevFriends) =>
        prevFriends.map((friend) => ({
          ...friend,
          isOnline: onlineEmails.includes(friend.email),
        }))
      );
    });

    return () => {
      socket.off("update-users");
    };
  }, [userEmail]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleAddFriend = async (friendEmail) => {
    console.log("Adding friend:", friendEmail);
    console.log("User email:", userEmail);
    try {
      setLoadingFriendEmail(friendEmail);
      await axios.post("http://localhost:8080/api/add-friend", {
        userEmail,
        friendEmail,
      });

      const addedUser = users.find((user) => user.email === friendEmail);
      if (addedUser) {
        setFriends((prev) =>
          [
            ...prev,
            {
              photoURL: addedUser.photoURL,
              email: addedUser.email,
              displayName: addedUser.displayName,
              isOnline: addedUser.isOnline || false,
            },
          ].sort((a, b) => a.displayName.localeCompare(b.displayName))
        );
      }
      toast.success("เพิ่มเพื่อนสำเร็จ!");
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("ไม่สามารถเพิ่มเพื่อนได้");
    } finally {
      setLoadingFriendEmail(null);
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

  const isFriend = (email) =>
    Array.isArray(friends) && friends.some((friend) => friend.email === email);

  const handleProfileClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
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

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchTerm) &&
      user.email !== userEmail
  );
  // console.log("filteredUsers", filteredUsers);
  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/users/${userEmail}`
      );
      const userData = {
        ...res.data,
        following: Array.isArray(res.data.following) ? res.data.following : [],
      };
      setCurrentUser(userData);
      setLoadingCurrentUser(false);
    } catch (err) {
      console.error("Error fetching currentUser:", err);
      setCurrentUser(null);
      setLoadingCurrentUser(false);
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

  useEffect(() => {
    if (!userEmail) {
      setCurrentUser(null);
      setLoadingCurrentUser(false);
      return;
    }
    fetchCurrentUser();
  }, [userEmail]);

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

  const filteredFriends = friends.filter((friend) =>
    friend.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );
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
  useEffect(() => {
    const getNickNameF = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/api/get-all-nicknames"
        );
        console.log("NickName:", res.data);
        getNickName(res.data);
      } catch (err) {
        console.error("โหลด nickname ล้มเหลว:", err);
      }
    };
    getNickNameF();
  }, []);
  console.log("filteredFriends:", filteredFriends);
  console.log("filteredUsers:", filteredUsers);

  return (
    <RequireLogin>
      <div className={`fr-container ${isDarkMode ? "dark-mode" : ""}`}>
        <div className="text-xl-font-semibold">
          <h1>Friend</h1>
        </div>
        <div className="search-friend-con">
          <input
            type="text"
            placeholder="🔍 Search Friend"
            value={searchTerm}
            onChange={handleSearch}
            className="search-input-friend"
          />
        </div>
        <div className="slide-con">
          <h2>Favorite</h2>
          <div
            className={
              filteredFriends.length === filteredUsers.length
                ? "special-friend-list"
                : filteredFriends.length > 0
                ? "con-friend-list"
                : "empty-friend-list"
            }
          >
            <ul className="friend-list">
              {filteredFriends.length > 0 ? (
                filteredFriends.map((friend, index) => (
                  <li key={index} className="button-friend-item">
                    <img
                      src={friend.photoURL}
                      // alt={friend.displayName}
                      className="friend-photo"
                    />
                    <div className="friend-detailss">
                      <span className="friend-name">
                        {getnickName.find((n) => n.email === friend.email)
                          ?.nickname || friend.displayName}
                      </span>
                      <span className="friend-email">{friend.email}</span>
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
                        ref={(el) => (dropdownRefs.current[friend.email] = el)}
                      >
                        <button
                          onClick={() =>
                            setOpenMenuFor((prev) =>
                              prev === friend.email ? null : friend.email
                            )
                          }
                          className="dropdown-toggle"
                        >
                          <BsThreeDots size={20} />
                        </button>

                        {openMenuFor === friend.email && (
                          <div className="dropdown-menu">
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                handleProfileClick(friend);
                                fetchFollowInfo(friend.email);
                                setOpenMenuFor(null);
                              }}
                            >
                              Profile
                            </button>

                            <button
                              className="dropdown-item"
                              onClick={() => {
                                if (
                                  !currentUserfollow ||
                                  !Array.isArray(currentUserfollow.following)
                                )
                                  return;
                                handleFollow(friend.email);
                              }}
                            >
                              {Array.isArray(currentUserfollow?.following) &&
                              currentUserfollow.following.includes(friend.email)
                                ? "Following"
                                : "Follow"}
                            </button>

                            <button
                              className="dropdown-item danger"
                              onClick={() => {
                                handleRemoveFriend(friend.email);
                                setOpenMenuFor(null);
                              }}
                              disabled={loadingFriendEmail === friend.email}
                            >
                              {loadingFriendEmail === friend.email
                                ? "Deleting..."
                                : "Delete Friend"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <div className="empty-friend">
                  <p>No friends found</p>
                </div>
              )}
            </ul>
          </div>
          <h2>Other</h2>
          <div
            className={
              filteredUsers.length > 0 && filteredFriends.length === 0
                ? "special-friend-recommand"
                : filteredUsers.length === filteredFriends.length
                ? "empty-friend-recommand"
                : "con-friend-recommand"
            }
          >
            <ul className="friend-recommend">
              {!loadingCurrentUser &&
                filteredUsers
                  .filter((user) => !isFriend(user.email))
                  .map((user, index) => (
                    <li key={index} className="button-friend-item">
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="friend-photo"
                      />
                      <div className="friend-detailss">
                        <span className="friend-name">
                          {getnickName.find((n) => n.email === user.email)
                            ?.nickname || user.displayName}
                        </span>
                        <span className="friend-email">{user.email}</span>
                      </div>
                      <div className="con-right">
                        <span
                          className={`status ${
                            user.isOnline ? "online" : "offline"
                          }`}
                        >
                          {user.isOnline ? "ออนไลน์" : "ออฟไลน์"}
                        </span>
                        <button
                          className="add-friend-btn"
                          onClick={() => handleAddFriend(user.email)}
                          disabled={loadingFriendEmail === user.email}
                        >
                          {loadingFriendEmail === user.email ? (
                            "กำลังเพิ่ม..."
                          ) : (
                            <IoMdPersonAdd />
                          )}
                        </button>
                        <div
                          className="dropdown-wrapper"
                          ref={(el) => (dropdownRefs.current[user.email] = el)}
                        >
                          <button
                            onClick={() =>
                              setOpenMenuFor((prev) =>
                                prev === user.email ? null : user.email
                              )
                            }
                            className="dropdown-toggle"
                          >
                            <BsThreeDots size={20} />
                          </button>

                          {openMenuFor === user.email && (
                            <div className="dropdown-menu">
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  handleProfileClick(user);
                                  setOpenMenuFor(null);
                                }}
                              >
                                Profile
                              </button>
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  if (
                                    !currentUserfollow ||
                                    !Array.isArray(currentUserfollow.following)
                                  )
                                    return;
                                  handleFollow(user.email);
                                }}
                              >
                                {Array.isArray(currentUserfollow?.following) &&
                                currentUserfollow.following.includes(user.email)
                                  ? "Follwing"
                                  : "Follow"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
            </ul>
          </div>
        </div>

        {isModalOpen && selectedUser && (
          <div className="profile-modal">
            <div className="modal-content" ref={modalRef}>
              <div className="profile-info">
                <img
                  src={selectedUser.photoURL}
                  alt={selectedUser.displayName}
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

export default Friend;
