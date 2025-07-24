import { useEffect, useState, useRef } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const MatchList = ({
  joinedRooms,
  allEvents,
  setActiveUser,
  setRoombar,
  users,
  setIsGroupChat,
  isOpenMatch,
  setIsOpenMatch,
  handleProfileClick,
  loadingFriendRooms,
  openMenuFor,
  setUserImage,
  setOpenMenuFor,
  setJoinedRooms,
}) => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");
  const dropdownRefs = useRef({});
  const [loadingRoomId, setLoadingRoomId] = useState(null);

  const handleDeleteRoom = async (roomId, roomName) => {
    try {
      setLoadingRoomId(roomId);
      console.log("Deleting room:", roomId, "for user:", userEmail);
      await axios.delete(
        `${import.meta.env.VITE_APP_API_BASE_URL
        }/api/delete-joined-rooms/${roomId}/${userEmail}`
      );

      // อัปเดต state ทันที
      setJoinedRooms((prev) => ({
        ...prev,
        roomNames: prev.roomNames.filter((name) => name !== roomName),
        roomIds: prev.roomIds.filter((id) => id !== roomId), // ใช้ roomName ถ้าเก็บเป็นชื่อ
      }));

      toast.success("ลบห้องสําเร็จ!");
    } catch (error) {
      console.error("ลบห้องล้มเหลว:", error);
      toast.error("ลบห้องล้มเหลว!");
    } finally {
      setLoadingRoomId(null);
    }
  };
  const handleEnterRoom = (roomId) => {
    navigate(`/chat/${roomId}`);
  };
  
  const handleMenuClick = (roomId) => {
    setOpenMenuFor(prev => prev === roomId ? null : roomId);
  };

  // ปิด dropdown เมื่อคลิกนอก dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuFor) {
        const currentDropdown = dropdownRefs.current[openMenuFor];
        if (currentDropdown && !currentDropdown.contains(event.target)) {
          setOpenMenuFor(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuFor]);

  return (
    <div className="favorite-container">
      <div
        className="favorite-toggle"
        onClick={() => setIsOpenMatch((prev) => !prev)}
      >
        {isOpenMatch ? <FaChevronDown /> : <FaChevronRight />}
        <span>Match</span>
      </div>
      {isOpenMatch && (
        <div
          className={!isOpenMatch ? "group-container-open" : "group-container"}
        >
          {" "}
          <ul className="friend-list-chat">
            {joinedRooms.roomNames?.map((name, index) => {
              // ใช้ index เป็น fallback ถ้าไม่มี id จริง
              const roomId = joinedRooms.roomIds?.[index] || `${name}-${index}`;
              if (!name || !roomId) return null;
              // สร้าง key ที่ unique จริง ๆ
              const divKey = `${roomId}-${index}`;
              return (
                <div key={divKey}>
                  <ul>
                    {allEvents.map((room, i) => {
                      // สร้าง key ที่ unique สำหรับแต่ละ li
                      const liKey = `${room._id || room.roomId || room.title
                        }-${i}`;
                      return room.title === name ? (
                        <li
                          key={liKey}
                          className="chat-friend-item"
                          onClick={() => {
                            handleEnterRoom(room.roomId);
                            setUserImage(room);
                            // ตรวจสอบให้แน่ใจว่า room.usermatch เป็น email (string) เสมอ
                            const userEmail = typeof room.usermatch === 'object' ?
                              room.usermatch.email || null :
                              room.usermatch;

                            if (!userEmail) {
                              console.error('usermatch email not found!', room);
                              return;
                            }

                            setActiveUser(userEmail); // ส่ง email ของ usermatch ไปเป็น activeUser (receiver)
                            setRoombar(room.image, room.title);
                            setIsGroupChat(false);

                            // หา user object จาก users array เพื่อส่งให้ handleProfileClick
                            const userObject = users.find(u => u.email === userEmail) || { email: userEmail };
                            handleProfileClick(userObject);
                          }}
                        >
                          <img
                            src={(() => {
                              const user = users.find(
                                (u) => u.email === room.usermatch
                              );
                              return user && user.photoURL
                                ? user.photoURL
                                : "/default-profile.png"; // fallback รูป default
                            })()}
                            alt={room.title}
                            className="friend-photo"
                          />
                          <div className="friend-detailss">
                            <span className="friend-name">
                              {(() => {
                                const user = users.find(
                                  (u) => u.email === room.usermatch
                                );
                                return user && user.displayName
                                  ? user.displayName
                                  : room.usermatch; // fallback รูป default
                              })()}
                            </span>
                            <span className="friend-title">{room.title}</span>
                          </div>
                          {/* <div
                            className="chat-dropdown-wrapper"
                            ref={(el) => (dropdownRefs.current[room.roomId] = el)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMenuClick(room.roomId);
                              }}
                              className={`chat-dropdown-toggle ${openMenuFor === room.roomId ? 'active' : ''}`}
                            >
                              <BsThreeDots size={20} />
                            </button>
                            {openMenuFor === room.roomId && (
                              <div className="chat-dropdown-menu">
                                <button
                                  className="chat-dropdown-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const userObject = users.find(u => u.email === room.usermatch) || { email: room.usermatch };
                                    handleProfileClick(userObject);
                                    setOpenMenuFor(null);
                                  }}
                                >
                                  👤 ดูโปรไฟล์
                                </button>
                                <button
                                  className="chat-dropdown-item chat-danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRoom(room._id, room.title);
                                    setOpenMenuFor(null);
                                  }}
                                  disabled={loadingRoomId === room._id}
                                >
                                  {loadingRoomId === room._id
                                    ? "กำลังลบ..."
                                    : "🗑️ ลบห้องนี้"}
                                </button>
                              </div>
                            )}
                          </div> */}
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MatchList;
