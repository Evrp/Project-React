import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./roomlist.css";
import { toast } from "react-toastify";
import { useTheme } from "../../context/themecontext";

const RoomList = ({
  showOnlyMyRooms,
  isDeleteMode,
  selectedRooms,
  setSelectedRooms,
}) => {
  const userEmail = localStorage.getItem("userEmail");
  const displayName = localStorage.getItem("userName");
  const { isDarkMode } = useTheme();
  const [rooms, setRooms] = useState([]);
  const [joinedRoomIds, setJoinedRoomIds] = useState([]);
  const navigate = useNavigate();

  const handleRoomSelect = (roomId) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // ดึงห้องที่ user join แล้ว
        const filterjoinedRooms = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/api/user-rooms/${userEmail}`
        );
        // สมมติ API ส่งกลับเป็น { roomNames: [{ _id, name, ... }] }
        // ...existing code...
        console.log("Joined Rooms:", filterjoinedRooms.data);
        const joinedIds = Array.isArray(filterjoinedRooms.data.roomIds)
          ? filterjoinedRooms.data.roomIds.filter((id) => !!id)
          : [];
        console.log("Joined Room IDs:", joinedIds);
        setJoinedRoomIds(joinedIds);
        // ...existing code...

        // ดึงห้องทั้งหมด
        const res = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/api/allrooms`
        );
        setRooms(res.data);
      } catch (error) {
        console.error("ไม่สามารถโหลดห้อง:", error);
      }
    };
    fetchRooms();
  }, [userEmail]);

  // filter ห้องที่ user ยังไม่ได้ join
  const filteredRooms = showOnlyMyRooms
    ? rooms.filter((room) => room.createdBy === displayName)
    : rooms.filter((room) => !joinedRoomIds.includes(room._id));

  const handleAddCommunity = async (roomId, roomName) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/join-community`,
        {
          userEmail,
          roomId,
          roomName,
        }
      );
      toast.success("เข้าร่วมห้องสําเร็จ!");
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("ไม่สามารถเพิ่มเพื่อนได้");
    }
  };

  const handleEnterRoom = (roomId, roomName) => {
    navigate(`/chat/${roomId}`);
    handleAddCommunity(roomId, roomName);
  };

  return (
    <div className={`room-list ${isDarkMode ? "dark-mode" : ""}`}>
      {filteredRooms.map((room) => (
        <div
          key={room._id}
          className={`room-container ${
            selectedRooms.includes(room._id) ? "selected" : ""
          }`}
          onClick={() =>
            isDeleteMode
              ? handleRoomSelect(room._id)
              : handleEnterRoom(room._id, room.name)
          }
        >
          {room.image && (
            <img src={room.image} alt="room" className="room-image" />
          )}
          {isDeleteMode && (
            <div className="room-checkbox">
              <input
                type="checkbox"
                checked={selectedRooms.includes(room._id)}
                onChange={() => handleRoomSelect(room._id)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="room-info">
            <h4>{room.name}</h4>
            <p>{room.description}</p>
            <small>สร้างโดย: {room.createdBy}</small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomList;
