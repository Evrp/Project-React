import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';

const CommunityList = ({
  joinedRooms,
  allRooms,
  setActiveUser,
  setRoombar,
  isOpencom,
  setIsOpencom,
  setIsGroupChat,
  loadingFriendRooms,
  openMenuFor,
  setOpenMenuFor,
  dropdownRefs,
  setJoinedRooms
}) => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  const handleDeleteRoom = async (roomName, roomId) => {
    try {
      console.log(`Deleting room: ${roomName}, ID: ${roomId}`);
      await axios.delete(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/api/delete-joined-rooms/${roomName}/${userEmail}`
      );

      // อัปเดต state ทันที
      setJoinedRooms((prev) => ({
        ...prev,
        roomNames: prev.roomNames.filter((name) => name !== roomName),
        roomIds: prev.roomIds.filter((id) => id !== roomId && id !== roomName),
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
        onClick={() => setIsOpencom((prev) => !prev)}
      >
        {isOpencom ? <FaChevronDown /> : <FaChevronRight />}
        <span>Community</span>
      </div>
      {isOpencom && (
        <div
          className={!isOpencom ? "group-container-open" : "group-container"}
        >
          {" "}
          <ul className="friend-list-chat">
            {joinedRooms.roomNames?.map((name, index) => {
              // ใช้ index เป็น fallback ถ้าไม่มี id จริง
              const roomId = joinedRooms.roomIds?.[index] || `${name}-${index}`;
              if (!name || !roomId) return null;
              return (
                <div key={`container-${roomId}-${index}`}>
                  <ul>
                    {allRooms.map((room, i) =>
                      room.name === name ? (
                        <li
                          key={`room-${room._id || room.name}-${i}-${index}`}
                          className="chat-friend-item"
                          onClick={() => {
                            setActiveUser(room.name),
                              setRoombar(room.image, room.name);
                            setIsGroupChat(true);
                            handleEnterRoom(room._id);
                          }}
                        >
                          <img
                            src={room.image}
                            alt={room.name}
                            className="friend-photo"
                          />
                          <div className="friend-detailss">
                            <span className="friend-name">{room.name}</span>
                            <span className="friend-email">
                              Host:
                              {room.createdBy}
                            </span>
                          </div>
                          <div
                            className="dropdown-wrapper"
                            ref={(el) => (dropdownRefs.current[room.name] = el)}
                            onClick={(e) => e.stopPropagation()} // ป้องกันการเปิดแชทตอนกด dropdown
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuFor((prev) =>
                                  prev === room.name ? null : room.name
                                );
                              }}
                              className={`chat-dropdown-toggle ${openMenuFor === room.name ? 'active' : ''}`}
                            >
                              <BsThreeDots size={20} />
                            </button>

                            {openMenuFor === room.name && (
                              <div className="chat-dropdown-menu">
                                <button
                                  className="dropdown-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRoom(room.name, room._id);
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
  );
};

export default CommunityList;
