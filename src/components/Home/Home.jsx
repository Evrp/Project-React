import "./Home.css";
import EventList from "../ui/Eventlist";
import RequireLogin from "../ui/RequireLogin";
import { useTheme } from "../../context/themecontext";
import RoomMatch from "../community/roommatch";
import { useState, useEffect } from "react";
import axios from "axios";
import AccordionList from "../ui/AccordionList";

const Newcommu = () => {
  const userPhoto = localStorage.getItem("userPhoto");
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [selectedRooms, setSelectedRooms] = useState([]);

  useEffect(() => {
    const startwebhook = async () => {
      const userEmail = localStorage.getItem("userEmail");
      try {
        if (userEmail) {
          const response = await axios.post(
            `${import.meta.env.VITE_APP_MAKE_WEBHOOK_MATCH_URL}`,
            { email: userEmail }
          );
          console.log("Webhook started successfully:", response.data);
        }
      } catch (error) {
        console.error("Error starting webhook:", error);
      }
    };
    startwebhook();
  }, []);

  return (
    <RequireLogin>
      <div className={`main-con-home ${isDarkMode ? "dark-mode" : ""}`}>
        <div className="header">
          <div className="profile-section">
            <span className="bell-icon">&#128276;</span>
            <span className="divider">|</span>
            <img src={userPhoto} alt="Profile" className="profile-image-com" />
          </div>
        </div>
        <div className="event-list-co">
          {/* <h2 className="event-title">Community Recommand</h2> */}
          <div className="bg-event-con">
            <div className="show-commu">
              {/* ตัวอย่างข้อมูล สามารถดึงจาก API หรือ state ได้ */}
              <AccordionList
                items={[
                  {
                    title: "กีฬา",
                    genres: [
                      { title: "ฟุตบอล", tabs: ["พรีเมียร์ลีก", "ลาลีกา"] },
                      { title: "บาสเกตบอล", tabs: ["NBA", "EuroLeague"] }
                    ]
                  }
                ]}
              />
              <EventList />
            </div>
            <RoomMatch
              isDeleteMode={isDarkMode}
              selectedRooms={selectedRooms}
              setSelectedRooms={setSelectedRooms}
            />
          </div>
        </div>
      </div>
    </RequireLogin>
  );
};

export default Newcommu;
