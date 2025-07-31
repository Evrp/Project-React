import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

const CommunityList = ({
  joinedRooms,
  allRooms,
  setActiveUser,
  setRoombar,
  isOpencom,
  setIsOpencom,
  selectedTab,
  setSelectedTab,
  setUserImage,
  setIsGroupChat,
}) => {
  const navigate = useNavigate();
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
                          className={`chat-friend-item ${
                            selectedTab === room.name ? "selected" : ""
                          }`}
                          onClick={() => {
                            setSelectedTab(room.name);
                            setActiveUser(room.name);
                            setRoombar(room.image, room.name);
                            setIsGroupChat(true);
                            setUserImage(room);
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
