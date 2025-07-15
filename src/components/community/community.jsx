import "./community.css";
import CreateRoom from "./createroom";
import RoomList from "./roomlist";
import { useState, useEffect, useRef } from "react";
import RequireLogin from "../ui/RequireLogin";
import DropdownMenu from "../../context/dropdownuser";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import io from "socket.io-client";
import { useTheme } from "../../context/themecontext";
import RoomMatch from "./roommatch";

const socket = io(import.meta.env.VITE_APP_API_BASE_URL);

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
  const [showOnlyMyRooms, setShowOnlyMyRooms] = useState(false);
  const userEmail = localStorage.getItem("userEmail");
  const displayName = localStorage.getItem("userName");
  const photoURL = localStorage.getItem("userPhoto");
  const [friends, setFriends] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [genres, setGenres] = useState([]);
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [handlematchfriend, setHandleMatchFriend] = useState(false);
  const [getnickName, getNickName] = useState([]);

  useEffect(() => {
    fetchGmailUser(); // ดึงข้อมูล Gmail user จาก backend
  }, []);

  const handleNewRoom = (room) => {
    setRooms((prev) => [...prev, room]);
  };
  const handleMatchFriend = () => {
    setHandleMatchFriend((prev) => !prev);
  };
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleCloseModal();
    }
  };
  const handleDeleteSelectedRooms = async () => {
    if (selectedRooms.length === 0) {
      toast.warning("กรุณาเลือกห้องที่ต้องการลบ");
      return;
    }
    console.log("selectedRooms", selectedRooms);

    const confirm = window.confirm(
      `คุณแน่ใจว่าต้องการลบ ${selectedRooms.length} ห้องหรือไม่?`
    );
    if (!confirm) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/delete-rooms`,
        {
          selectedRooms: selectedRooms,
        }
      );

      // อัปเดตรายการห้องหลังลบ
      const res = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/allrooms`
      );
      setRooms(res.data);

      toast.success(`ลบห้องสำเร็จ ${selectedRooms.length} ห้อง`);
      setSelectedRooms([]);
      setIsDeleteMode(false);
    } catch (error) {
      console.error("Error deleting rooms:", error);
      toast.error("เกิดข้อผิดพลาดในการลบห้อง");
    }
  };

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

  const fetchMatches = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_APP_API_BASE_URL}/matches/${loggedInEmail}`
      );
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
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/users/${loggedInEmail}`
      );
      const data = await res.json();
      setCurrentUserfollow(data);
    } catch (err) {
      console.error("โหลด currentUserfollow ไม่ได้:", err);
    }
  };

  useEffect(() => {
    const getGenres = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_APP_API_BASE_URL
          }/api/filters/${loggedInEmail}`
        );
        setGenres(res.data);
      } catch (err) {
        console.error("โหลด Gmail currentUser ไม่ได้:", err);
      }
    };
    getGenres();
    if (genres) {
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
    const url = `${
      import.meta.env.VITE_APP_API_BASE_URL
    }/api/users/${userEmail}/${
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
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/users/${userEmail}`
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
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/api/user/${targetEmail}/follow-info`
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
          `${import.meta.env.VITE_APP_API_BASE_URL}/api/get-all-nicknames`
        );
        getNickName(res.data);
      } catch (err) {
        console.error("โหลด nickname ล้มเหลว:", err);
      }
    };
    getNickNameF();
  }, []);

  return (
    <RequireLogin>
      <div className={`main-content-com ${isDarkMode ? "dark-mode" : ""}`}>
        <div className="profile-section">
          <span className="bell-icon">&#128276;</span>
          <span className="divider">|</span>
          <img src={userPhoto} alt="Profile" className="profile-image-com" />
        </div>
        <div className="filter-container">
          <CreateRoom onRoomCreated={handleNewRoom} />
          <button
            className={"filter-button" + (showOnlyMyRooms ? " active" : "")}
            onClick={() => setShowOnlyMyRooms(!showOnlyMyRooms)}
          >
            {showOnlyMyRooms ? "All rooms" : "My rooms"}
          </button>
          {(showOnlyMyRooms || selectedRooms.length > 0) && (
            <button
              className={`delete-button-all-room ${
                isDeleteMode ? "active" : ""
              }`}
              onClick={() => {
                if (showOnlyMyRooms) {
                  setIsDeleteMode(!isDeleteMode);
                  if (isDeleteMode) setSelectedRooms([]);
                } else {
                  toast.warning(
                    "สามารถลบห้องได้เฉพาะในโหมด 'My rooms' เท่านั้น"
                  );
                }
              }}
            >
              {isDeleteMode
                ? `ยกเลิก (${selectedRooms.length})`
                : selectedRooms.length > 0
                ? `ลบห้อง (${selectedRooms.length})`
                : "ลบห้อง"}
            </button>
          )}
          {isDeleteMode && selectedRooms.length > 0 && (
            <button
              className="confirm-delete-button"
              onClick={handleDeleteSelectedRooms}
            >
              ยืนยันการลบ ({selectedRooms.length})
            </button>
          )}
          <button className="filter-button" onClick={handleMatchFriend}>
            Match Friend
          </button>
        </div>
        <div className="container-content">
          {handlematchfriend === true ? (
            <RoomMatch
              isDeleteMode={isDeleteMode}
              selectedRooms={selectedRooms}
              setSelectedRooms={setSelectedRooms}
            />
          ) : (
            <RoomList
              showOnlyMyRooms={showOnlyMyRooms}
              rooms={rooms}
              isDeleteMode={isDeleteMode}
              selectedRooms={selectedRooms}
              setSelectedRooms={setSelectedRooms}
            />
          )}

          <div className="recommentfreind">
            <h2 className="grd">FREIND MATCH</h2>
            <div className="con-card">
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

                    <h3>
                      {(getnickName &&
                        getnickName.find((n) => n.email === friend.email)
                          ?.nickname) ||
                        friend.displayName}
                    </h3>
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
            </div>

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
