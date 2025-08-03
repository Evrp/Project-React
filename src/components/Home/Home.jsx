import "./Home.css";
import EventList from "./event/Eventlist";
import RequireLogin from "../ui/RequireLogin";
import { useTheme } from "../../context/themecontext";
import RoomMatch from "../community/roommatch";
import { useState, useEffect } from "react";
import axios from "axios";
import AccordionList from "./cardmatch/AccordionList";
import HeaderProfile from "../ui/HeaderProfile";

const Newcommu = () => {
  const userPhoto = localStorage.getItem("userPhoto");
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [selectedRooms, setSelectedRooms] = useState([]);


  return (
    <RequireLogin>
      <div className={`main-con-home ${isDarkMode ? "dark-mode" : ""}`}>
        <header className="header-home">
          <HeaderProfile 
            userPhoto={userPhoto} 
            className="profile-section-home" 
          />
        </header>
        <div className="event-list-co">
          <div className="bg-event-con">
            <div className="show-commu">
              <div className="accordion-desktop-only">
                <AccordionList
                  items={[
                    {
                      title: "กีฬา",
                      genres: [
                        { title: "Educational and self-development", tabs: ["Art/Craft Workshops", "Seminars / Short Courses","Talk show/Lecture"] },
                        { title: "Entertainment and cultural", tabs: ["Art exhibition/Gallery", "Art/Craft Workshops","Film festival/Musical","Talk show/Lecture"] },
                        { title: "Families and children", tabs: ["Camp", "Kids Fair","Theme park"] },
                        { title: "Group/Specialized", tabs: ["Carnival/Event", "Volunteer"] },
                        { title: "Sports and health", tabs: ["Marathon", "Audox Tour","Yoga","Swimming","Cycling","Walking","Running","Fitness","Gym"] },
                        { title: "Social and community", tabs: ["Annual festival", "Temple fair","Red Cross fair"] },
                        { title: "Travel and adventure", tabs: ["Camping", "Trip", "School trip", "Scuba diving","Photo trip","Trekking","Adventure","Cafe","Tour"] },
                      ]
                    }
                  ]}
                />
              </div>
              <EventList />
            </div>
            <RoomMatch
              isDeleteMode={isDarkMode}
              selectedRooms={selectedRooms}
              setSelectedRooms={setSelectedRooms}
              accordionComponent={
                <AccordionList
                  items={[
                    {
                      title: "กีฬา",
                      genres: [
                        { title: "Educational and self-development", tabs: ["Art/Craft Workshops", "Seminars / Short Courses","Talk show/Lecture"] },
                        { title: "Entertainment and cultural", tabs: ["Art exhibition/Gallery", "Art/Craft Workshops","Film festival/Musical","Talk show/Lecture"] },
                        { title: "Families and children", tabs: ["Camp", "Kids Fair","Theme park"] },
                        { title: "Group/Specialized", tabs: ["Carnival/Event", "Volunteer"] },
                        { title: "Sports and health", tabs: ["Marathon", "Audox Tour","Yoga","Swimming","Cycling","Walking","Running","Fitness","Gym"] },
                        { title: "Social and community", tabs: ["Annual festival", "Temple fair","Red Cross fair"] },
                        { title: "Travel and adventure", tabs: ["Camping", "Trip", "School trip", "Scuba diving","Photo trip","Trekking","Adventure","Cafe","Tour"] },
                      ]
                    }
                  ]}
                />
              }
            />
          </div>
        </div>
      </div>
    </RequireLogin>
  );
};

export default Newcommu;
