import React from "react";
import "./Profile.css";

const Profile = () => {
  const userName = localStorage.getItem("userName");
  const userPhoto = localStorage.getItem("userPhoto");

  return (
    <div className="container-profile">
      {/* <div className="sidebar">
        <div className="logo">FindFriend</div>
        <ul className="menu">
          <li><i className="fas fa-users"></i>Community</li>
          <li><i className="fas fa-user"></i>Profile</li>
          <li><i className="fas fa-user-friends"></i>Friend</li>
          <li><i className="fas fa-cog"></i>Setting</li>
        </ul>
        <button className="create-btn">Create</button>
      </div> */}

      <div className="profile-container">
        {/* ใช้รูปจากบัญชี Google ถ้ามี */}
        <img
          src={userPhoto}
          alt="Profile"
          className="profile-image"
        />
        <h2>{userName ? `Welcome, ${userName}` : "Profile Another"}</h2>

        <div className="info-wrapper">
          <div className="info-box">
            <h3>ข้อมูล</h3>
            <p>รายละเอียดข้อมูลของผู้ใช้...</p>
          </div>
          <div className="info-box">
            <h3>คำอธิบาย</h3>
            <p>คำอธิบายเกี่ยวกับโปรไฟล์...</p>
          </div>
          <div className="info-box">
            <h3>ข้อมูลเพิ่มเติม</h3>
            <p>รายละเอียดอื่น ๆ...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
