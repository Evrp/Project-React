import React from 'react';
import './Newcommu.css';
import { EventContext } from "../context/eventcontext";
import { useContext } from "react";

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
      {events.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold">กิจกรรมที่พบ:</h3>
              <ul className="mt-4">
                {events.map((event, index) => (
                  <li key={index} className="mb-4">
                    <h4 className="text-md font-bold">{event.name}</h4>
                    <p>ราคา: {event.price}</p>
                    <p>
                      ลิงค์:{" "}
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        ดูสินค้า
                      </a>
                    </p>
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.name}
                        className="w-full mt-4 rounded-md"
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
    </div>
  );
};

export default Newcommu;
