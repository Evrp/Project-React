import "./community.css";
import CreateRoom from "./createroom";
import RoomList from "./roomlist";
import { useState, useEffect, useRef } from "react";
import RequireLogin from "../ui/RequireLogin";
import DropdownMenu from "../ui/dropdown";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import io from "socket.io-client";
const socket = io("http://localhost:8080");

const Newcommu = () => {
  const userPhoto = localStorage.getItem("userPhoto");
  const loggedInEmail = localStorage.getItem("userEmail");

  const [rooms, setRooms] = useState([]);
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUserfollow, setCurrentUserfollow] = useState(null);
  const [loadingFriendEmail, setLoadingFriendEmail] = useState(null);
  const modalRef = useRef(null);
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const dropdownRefs = useRef({});
  const userEmail = localStorage.getItem("userEmail");
  const displayName = localStorage.getItem("userName");
  const photoURL = localStorage.getItem("userPhoto");
  const [friends, setFriends] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    fetchGmailUser(); // ดึงข้อมูล Gmail user จาก backend
  }, []);

  const handleNewRoom = (room) => {
    setRooms((prev) => [...prev, room]);
  };
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleCloseModal();
    }
  };

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

  const fetchMatches = async () => {
    try {
      const res = await fetch(`http://localhost:8080/matches/${loggedInEmail}`);
      const data = await res.json();
      setMatches(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการโหลด matches:", error);
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchCurrentUserFollow = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/users/gmail/${loggedInEmail}`
      );
      const data = await res.json();
      setCurrentUserfollow(data);
    } catch (err) {
      console.error("โหลด currentUserfollow ไม่ได้:", err);
    }
  };

  useEffect(() => {
    if (loggedInEmail) {
      fetchMatches();
      fetchCurrentUserFollow();
    }
  }, [loggedInEmail]);

  const handleFollow = async (friendEmail) => {
    await fetchGmailUser();
    if (!currentUserfollow || !Array.isArray(currentUserfollow.following)) {
      console.warn("currentUser ยังไม่พร้อม หรือ following ไม่มี");
      return;
    }

    const isFollowing = currentUserfollow.following.includes(friendEmail);
    const url = `http://localhost:8080/api/users/${userEmail}/${
      isFollowing ? "unfollow" : "follow"
    }/${friendEmail}`;
    const method = isFollowing ? "DELETE" : "POST";

    try {
      await axios({ method, url });
      await fetchGmailUser();
    } catch (err) {
      console.error("Follow/unfollow error:", err);
    }
  };

  const handleProfileClick = (friend) => {
    setSelectedUser(friend);
    setIsModalOpen(true);
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
    if (userEmail) {
      fetchUsersAndFriends();
    }
  }, [userEmail]);
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

  return (
    <RequireLogin>
      <div className="main-content-com">
        <div className="profile-section">
          <span className="bell-icon">&#128276;</span>
          <span className="divider">|</span>
          <img src={userPhoto} alt="Profile" className="profile-image-com" />
        </div>

        <CreateRoom onRoomCreated={handleNewRoom} />

        <div className="container-content">
          <RoomList rooms={rooms} />

          <div className="recommentfreind">
            <h2 className="grd">FREIND MATCH</h2>
            {matches.length === 0 ? (
              <p>ไม่พบเพื่อนที่มีความสนใจเหมือนกัน</p>
            ) : (
              matches.map((friend, index) => (
                <div key={index} className="friend-card">
                    <div className="dfd"></div>
                    <div className="header-friend-card">
                      <h1 className="ee">ee</h1>
                      <img
                        src={friend.photoURL}
                        alt="profile"
                        className="friend-image"
                        style={{ borderRadius: "50%", width: "60px" }}
                      />
                      <div className="rr">
                        <DropdownMenu
                          user={friend}
                          currentUserfollow={currentUserfollow}
                          loadingFriendEmail={loadingFriendEmail}
                          onProfileClick={handleProfileClick}
                          onFollow={handleFollow}
                          fetchFollowInfo={fetchFollowInfo}
                        />
                      </div>
                    </div>
                 

                  <h3>{friend.displayName}</h3>
                  <p>{friend.email}</p>
                  <p>หมวดหมู่: {friend.genres.join(", ")}</p>

                  {friend.subGenres &&
                    Object.keys(friend.subGenres).length > 0 && (
                      <ul>
                        {Object.entries(friend.subGenres).map(
                          ([category, topics]) => (
                            <li key={category}>
                              {category}: {topics.join(", ")}
                            </li>
                          )
                        )}
                      </ul>
                    )}
                </div>
              ))
            )}
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
                    <p>
                      สถานะ: {selectedUser.isOnline ? "ออนไลน์" : "ออฟไลน์"}
                    </p>
                    <button className="close-btn" onClick={handleCloseModal}>
                      ปิด
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireLogin>
  );
};

export default Newcommu;
