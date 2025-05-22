import "./community.css";
import CreateRoom from "./createroom";
import RoomList from "./roomlist";
import { useState, useEffect } from "react";
import RequireLogin from "../ui/RequireLogin";
import { data } from "autoprefixer";
const Newcommu = () => {
  const userPhoto = localStorage.getItem("userPhoto");
  const loggedInEmail = localStorage.getItem("userEmail");
  const [rooms, setRooms] = useState([]);
  const [matches, setMatches] = useState([]);

  const handleNewRoom = (room) => {
    setRooms((prev) => [...prev, room]);
  };
  const fetchMatches = async () => {
    try {
      const res = await fetch(`http://localhost:8080/matches/${loggedInEmail}`);
      const data = await res.json();
      setMatches(data);
      console.log(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการโหลด matches:", error);
    }
  };

  // ดึงข้อมูล matches ตอน component โหลด
  useEffect(() => {
    if (loggedInEmail) {
      fetchMatches();
    }
  }, [loggedInEmail]);

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
            <h2>Recommend Friend</h2>
            {matches.length === 0 ? (
              <p>ไม่พบเพื่อนที่มีความสนใจเหมือนกัน</p>
            ) : (
              matches.map((match, index) => (
                <div key={index} className="friend-card">
                  <img
                    src={match.photoURL}
                    alt="profile"
                    style={{ borderRadius: "50%", width: "60px" }}
                  />
                  <h3>{match.displayName}</h3>
                  <p>{match.email}</p>
                  <p>หมวดหมู่: {match.genres.join(", ")}</p>
                  {/* แสดงหัวข้อย่อยถ้ามี */}
                  {match.subGenres &&
                    Object.keys(match.subGenres).length > 0 && (
                      <ul>
                        {Object.entries(match.subGenres).map(
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
        </div>
      </div>
    </RequireLogin>
  );
};

export default Newcommu;
