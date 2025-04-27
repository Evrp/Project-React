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
        <h1></h1>
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
    
      <div className="event-list">
        <EventList />
      </div>
    </div>
  );
};

export default Newcommu;
