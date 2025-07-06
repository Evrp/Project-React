import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import axios from "axios";
import { toast } from "react-toastify";

const MatchList = ({
  joinedRooms,
  allEvents,
  setActiveUser,
  setRoombar,
  setIsGroupChat,
  isOpenMatch,
  setIsOpenMatch,
  loadingFriendRooms,
  openMenuFor,
  setOpenMenuFor,
  dropdownRefs,
  setJoinedRooms,
}) => {
  const userEmail = localStorage.getItem("userEmail");

  const handleDeleteRoom = async (roomName) => {
    try {
      await axios.delete(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/api/delete-joined-rooms/${roomName}/${userEmail}`
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
              const roomId = joinedRooms.roomNames?.[index];
              console.log("Room ID:", roomId);
              console.log("Room Name:", allEvents);
              // ข้ามถ้า name หรือ id เป็น null
              if (!name || !roomId) return null;

              return (
                <div key={roomId}>
                  {/* <h1>{name}</h1> */}
                  <ul>
                    {allEvents.map((room) =>
                      room.title === name ? (
                   
                        // ถ้า room.title ตรงกับ name ที่ได้จาก joinedRooms
                        <li
                          // key={room.roomId}
                          className="chat-friend-item"
                          onClick={() => {
                            setActiveUser(room.title),
                              setRoombar(room.image, room.title);
                            setIsGroupChat(true);
                          }}
                        >
                          <img
                            src={room.image}
                            alt={room.title}
                            className="friend-photo"
                          />
                          <div className="friend-detailss">
                            <span className="friend-name">{room.title}</span>
                          </div>
                          <div
                            className="dropdown-wrapper"
                            ref={(el) => (dropdownRefs.current[room.title] = el)}
                            onClick={(e) => e.stopPropagation()} // ป้องกันการเปิดแชทตอนกด dropdown
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
                                    handleDeleteRoom(room.title);
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

export default MatchList;
