import React from "react";
import "./Home.css";

function Home() {
  return (
    <div className="container-main">
      {/* <div className="sidebar">
        <div className="logo">FindFriend</div>
        <ul className="menu">
          <li>
            <i className="fas fa-users"></i> Community
          </li>
          <li>
            <i className="fas fa-user"></i> Profile
          </li>
          <li>
            <i className="fas fa-user-friends"></i> Friend
          </li>
          <li>
            <i className="fas fa-cog"></i> Setting
          </li>
        </ul>
     
      </div> */}

      <div class="main-content">
        <div class="header">
          <h1>Hello Boss!</h1>
          <div class="profile-section">
            <span class="bell-icon">&#128276;</span>
            <span class="divider">|</span>
            {/* <img src="profile.jpg" alt="Profile" class="profile-pic"> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
