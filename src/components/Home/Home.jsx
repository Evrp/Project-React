import "./Home.css";
import EventList from "../ui/Eventlist";
import RequireLogin from "../ui/RequireLogin";
import { useTheme } from "../../context/themecontext";

const Newcommu = () => {
  const userPhoto = localStorage.getItem("userPhoto");
  const { isDarkMode, setIsDarkMode } = useTheme();


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
          <EventList />
        </div>
      </div>
    </RequireLogin>
  );
};

export default Newcommu;
