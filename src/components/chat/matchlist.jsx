import { useEffect, useState } from "react";
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
  setOpenMenuFor,
  dropdownRefs,
  setJoinedRooms,
}) => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  const handleDeleteRoom = async (roomId, roomName) => {
    try {
      console.log("Deleting room:", roomId, "for user:", userEmail);
      await axios.delete(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
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
    }
  };
  const handleEnterRoom = (roomId) => {
    navigate(`/chat/${roomId}`);
  };

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
              return (
                <div key={roomId}>
                  <ul>
                    {allEvents.map((room, i) =>
                      room.title === name ? (
                        <li
                          key={room._id || `${room.title}-${i}`}
                          className="chat-friend-item"
                          onClick={() => {
                            handleEnterRoom(room.roomId);
                            setActiveUser(room.usermatch); // ส่ง email ของ usermatch ไปเป็น activeUser (receiver)
                            setRoombar(room.image, room.title);
                            setIsGroupChat(false);
                            handleProfileClick(room.usermatch);
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
                            className="dropdown-wrapper"
                            ref={(el) =>
                              (dropdownRefs.current[room.title] = el)
                            }
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuFor((prev) =>
                                  prev === room.title ? null : room.title
                                );
                              }}
                              className="dropdown-toggle"
                            >
                              <BsThreeDots size={20} />
                            </button>
                            {openMenuFor === room.title && (
                              <div className="chat-dropdown-menu">
                                <button
                                  className="dropdown-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRoom(room._id, room.title);
                                    setOpenMenuFor(null);
                                  }}
                                  disabled={loadingFriendRooms === room.title}
                                >
                                  {loadingFriendRooms === room.title
                                    ? "กำลังลบ..."
                                    : "🗑️ ลบห้อง"}
                                </button>
                              </div>
                            )}
                          </div> */}
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
  );
};

export default MatchList;
