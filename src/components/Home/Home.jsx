import "./Home.css";
import EventList from "../ui/Eventlist";
import RequireLogin from "../ui/RequireLogin";
const Newcommu = () => {
  const userPhoto = localStorage.getItem("userPhoto");
  return (
    <RequireLogin>
      <div className="main-contentnn">
        <div className="header">
          <div className="profile-section">
            <span className="bell-icon">&#128276;</span>
            <span className="divider">|</span>
            <img src={userPhoto} alt="Profile" className="profile-image-com" />
          </div>
        </div>
        <div className="event-list">
          <EventList />
        </div>
      </div>
    </RequireLogin>
  );
};

export default Newcommu;
