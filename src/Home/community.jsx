import React from "react";
import "./community.css";
import { IoSearch } from "react-icons/io5";
const room = [
  "Room1",
  "Room2",
  "Room3",
  "Room4",
  "Room5",
  "Room6",
  "Room7",
  "Room8",
];
const type = [
  "ฟุตบอล",
  "ฟุตบอล",
  "ฟุตบอล",
  "ฟุตบอล",
  "ฟุตบอล",
  "ฟุตบอล",
  "ฟุตบอล",
  "ฟุตบอล",
];
const Community = () => {
  return (
    <div className="community">
      <div className="com-img">
        <img
          src="src\assets\istockphoto-530810426-612x612.svg"
          alt="TypeScript Logo"
        />
        <button>เข้าร่วม</button>
      </div>
      <div className="room">
        <div className="search-room">
          <input type="text" placeholder="ค้นหาห้อง..." />
          <IoSearch />
        </div>

        <div className="container_filter">
          <div className="filter">
            <button>เกมส์</button>
            <button>ฟุตบอล</button>
            <button>เต้น</button>
            <button>ชมรม</button>
            <button>ปิงปอง</button>
            <button>แบตมินตัน</button>
            <button>เทนนิส</button>
            <button>เปตอง</button>
            <button>ฟุตซอล</button>
            <button>บาสเกสบอล</button>
          </div>
        </div>

        {room.map((msg, index) => (
          <div className="NameRoom" key={index}>
            <p>{msg}</p>
          </div>
        ))}
       
      </div>
    </div>
  );
};

export default Community;
