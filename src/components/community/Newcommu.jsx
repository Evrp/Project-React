import "./Newcommu.css";
import CreateRoom from "./createroom";
import RoomList from "./roomlist";
import { useState, useEffect } from "react";
import RequireLogin from "../ui/RequireLogin";
const Newcommu = () => {
  const userPhoto = localStorage.getItem("userPhoto");
  const loggedInEmail = localStorage.getItem("email"); // ดึงอีเมลผู้ใช้ที่ล็อกอิน
  const [rooms, setRooms] = useState([]);
  const [matches, setMatches] = useState([]);

  const handleNewRoom = (room) => {
    setRooms((prev) => [...prev, room]);
  };

  // ดึงข้อมูล matches ตอน component โหลด
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        console.log(loggedInEmail);
        const res = await fetch(
          `http://localhost:8080/matches/${loggedInEmail}`
        );
        const data = await res.json();
        setMatches(data);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลด matches:", error);
      }
    };

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
          <div className="content-area">
            <RoomList rooms={rooms} />
          </div>
          <div className="recommentfreind">
            <h2>Recommend Friend</h2>
            {matches.length === 0 ? (
              <p>ไม่พบเพื่อนที่มีความสนใจเหมือนกัน</p>
            ) : (
              matches.map((match) => (
                <div key={match._id} className="friend-card">
                  <h3>{match.email}</h3>
                  <p>
                    <strong>หมวดหมู่:</strong> {match.genres.join(", ")}
                  </p>
                  {match.subGenres &&
                    Object.keys(match.subGenres).length > 0 && (
                      <div>
                        <strong>หัวข้อย่อย:</strong>
                        <ul>
                          {Object.entries(match.subGenres).map(
                            ([category, topics]) => (
                              <li key={category}>
                                {category}: {topics.join(", ")}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
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
