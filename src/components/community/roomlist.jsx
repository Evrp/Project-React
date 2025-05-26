import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./roomlist.css";
import { toast } from "react-toastify";

const RoomList = () => {
  const userEmail = localStorage.getItem("userEmail");
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/allroom");
        setRooms(res.data);
      } catch (error) {
        console.error("ไม่สามารถโหลดห้อง:", error);
      }
    };
    fetchRooms();

    
  }, []);
    const handleAddCommunity = async (roomId) => {
    console.log("Adding friend:", roomId);
    console.log("User email:", userEmail);
    try {
      await axios.post("http://localhost:8080/api/join-community", {
        userEmail,
        roomId,
      });
      toast.success("เข้าร่วมห้องสําเร็จ!");
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("ไม่สามารถเพิ่มเพื่อนได้");
    } finally {
      setLoadingFriendEmail(null);
    }
  };

  const handleEnterRoom = (roomId) => {
    navigate(`/chat/${roomId}`);
    handleAddCommunity(roomId);
  };

  return (
    <div className="room-list">
      {rooms.map((room) => (
        <div
          key={room._id}
          className="room-container"
          onClick={() => handleEnterRoom(room._id)}
        >
             {room.image && (
              <img src={room.image} alt="room" className="room-image" />
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
