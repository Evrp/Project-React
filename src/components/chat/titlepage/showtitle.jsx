import { useEffect, useState } from "react";
import axios from "axios";
import "./showtitle.css"; // ใช้ชื่อไฟล์ที่ถูกต้องเป็นตัวพิมพ์เล็ก
import { useNavigate } from "react-router-dom";

const ShowTitle = ({ userimage, openchat }) => {
  const [userEvents, setUserEvents] = useState([]);
  const [matchedEvent, setMatchedEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const fetchUserImage = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_BASE_URL}/api/all-events`
          );
          if (response.data) {
            setUserEvents(response.data);

            // กรอง (filter) ข้อมูลที่มี title ตรงกับ userimage.title
            if (Array.isArray(response.data)) {
              const matched = response.data.find(
                (event) => event.title === userimage.title
              );
              setMatchedEvent(matched);
            }
          } else {
            console.error("No image found for user:", userimage.userId);
          }
        } catch (error) {
          console.error("Error fetching user image:", error);
        }
      };

      fetchUserImage();
    } catch (err) {
      console.log(err);
    }
  }, [userimage]);
  const handleBackToMatching = () => {
    navigate("/home");
  };

  return (
    <div>
      {/* <div className="bg-title"> */}
      <div className={`bg-title ${openchat ? "mobile-layout-mode" : ""}`}>
        {matchedEvent ? (
          <div className="user-image">
            <h2 className="usertitle">{matchedEvent.title}</h2>
            <div className="event-details">
              {matchedEvent.genre && (
                <div className="event-genre">
                  หมวดหมู่: {matchedEvent.genre}
                </div>
              )}
              {matchedEvent.location && (
                <div className="event-location">
                  สถานที่: {matchedEvent.location}
                </div>
              )}
              {matchedEvent.date && (
                <div className="event-date">วันที่: {matchedEvent.date}</div>
              )}
              {matchedEvent.description && (
                <div className="event-description">
                  <p>{matchedEvent.description}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-no-title">
            <button className="back-button" onClick={handleBackToMatching}>Back to Matching</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowTitle;
