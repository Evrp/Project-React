import React from 'react';
import './Home.css';
import { EventContext } from "../context/eventcontext";
import { useContext } from "react";
import EventList from "../components/ui/Eventlist";

const Newcommu = () => {
  const userPhoto = localStorage.getItem("userPhoto");
  const { events } = useContext(EventContext);
  return (
    <div className="main-content">
      <div className="header">
        <h1>Hello Boss!</h1>
        <div className="profile-section">
          <span className="bell-icon">&#128276;</span>
          <span className="divider">|</span>
          <img
            src={userPhoto}
            alt="Profile"
            className="profile-image-com"
          />
        </div>
      </div>
      <div className="content-area">
        {/* บล็อกด้านบน */}
        <div className="top-block">
          <span>ชื่อห้อง</span>
          <i className="fas fa-edit"></i>
        </div>

        {/* บล็อกด้านล่าง */}
        <div className="bottom-blocks">
          <div className="small-block"></div>
          <div className="small-block"><i className="fas fa-image"></i></div>
        </div>

        {/* บล็อกข้าง */}
        <div className="side-block"></div>
      </div>
 
        <EventList />

     
    </div>
  );
};

export default Newcommu;
