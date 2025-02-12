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
          <p>ค้นหา</p>
          <IoSearch />
        </div>
        <div className="filter">
          <button></button>
          <button></button>
          <button></button>
          <button></button>
          <button></button>
          <button></button>
        </div>
        {room.map((msg, index) => (
          <div className="box" key={index}>
            <p>{msg}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
