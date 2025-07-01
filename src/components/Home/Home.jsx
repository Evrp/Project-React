import "./Home.css";
import EventList from "../ui/Eventlist";
import RequireLogin from "../ui/RequireLogin";
import { useTheme } from "../../context/themecontext";
import RoomMatch from "../community/roommatch";
import { useState } from "react"; 


const Newcommu = () => {
  const userPhoto = localStorage.getItem("userPhoto");
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [selectedRooms, setSelectedRooms] = useState([]);

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
          <h2 className="event-title">Community Recommand</h2>
          <div className="bg-event-con">
            <EventList />
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
