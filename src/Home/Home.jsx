import React from "react";
import "./Home.css";
import { useContext } from "react";
import { EventContext } from "../context/eventcontext";
<<<<<<< HEAD
// useEffect(() => {
//   fetch("http://localhost:8080/api/events")
//     .then((res) => res.json())
//     .then((data) => setEvents(data))
//     .catch((err) => console.error(err));
// }, []);
=======
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697

function Home() {
  const { events } = useContext(EventContext);
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
