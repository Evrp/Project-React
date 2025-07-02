import { useEffect, useState, useRef, React } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TinderCard from "react-tinder-card";
import { useTheme } from "../../context/themecontext";
import "./roommatch.css";

const RoomMatch = () => {
  const userEmail = localStorage.getItem("userEmail");
  const { isDarkMode } = useTheme();
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const childRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/api/events-match`
        );
        setRooms(res.data);
        setCurrentIndex(res.data.length - 1);
        childRefs.current = Array(res.data.length)
          .fill(0)
          .map((_, i) => childRefs.current[i] || React.createRef());
      } catch (error) {
        console.error("โหลดห้องไม่สำเร็จ:", error);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchGmails = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/api/users`
        );
        setUsers(res.data);
      } catch (error) {
        console.error("โหลดห้องไม่สำเร็จ:", error);
      }
    };
    fetchGmails();
  }, []);

  const handleEnterRoom = (roomId) => {
    navigate(`/chat/${roomId}`);
  };

  const swiped = (direction, roomId, index) => {
    if (direction === "right") {
      handleEnterRoom(roomId);
    }
    setCurrentIndex((prev) => prev - 1);
  };

  const swipe = async (dir) => {
    if (currentIndex >= 0 && currentIndex < rooms.length) {
      await childRefs.current[currentIndex]?.current?.swipe(dir);
    }
  };

  return (
    <div className={`room-match-container ${isDarkMode ? "dark-mode" : ""}`}>
      <div className="card-stack">
        {rooms.map((room, index) => (
          <TinderCard
            ref={childRefs.current[index]}
            key={room._id}
            onSwipe={(dir) => swiped(dir, room._id, index)}
            preventSwipe={["up", "down"]}
            className="tinder-card"
          >
            <div className="room-card-match">
              {room.image && (
                <img src={room.image} alt="room" className="room-image" />
              )}
              <div className="room-info">
                <h4>{room.title}</h4>
                <p>{room.email}</p>
              </div>
            </div>
          </TinderCard>
        ))}
      </div>

      <div className="button-group">
        <button onClick={() => swipe("left")} className="skip-button">
          Skip
        </button>
        <button
          onClick={() =>
            currentIndex >= 0 && handleEnterRoom(rooms[currentIndex]._id)
          }
          className="join-button"
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default RoomMatch;
