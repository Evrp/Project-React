import React, { useEffect, useState } from "react";
import axios from "axios";
import "../ui/Eventlist.css";
import { useTheme } from "../../context/themecontext";


const EventList = () => {
  const [events, setEvents] = useState([]);
  const [eventsImage, setEventsImage] = useState([]);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem("userEmail");
  const { isDarkMode, setIsDarkMode } = useTheme();

  const user = { email };

  const fetchimage = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/api/get-image-genres`);
      console.log("✅ Fetched:", res.data);

      const imageList = res.data.imageGenres;

      imageList.forEach((item) => {
        // console.log("🎨 Genre:", item.genres);
        // console.log("🖼️ Image:", item.image);
      });
      console.log("✅ Fetched:", imageList[1]);

      // หรือถ้าจะเก็บใน state:
      setEventsImage(imageList);

    } catch (err) {
      console.error("❌ Error fetching images:", err);
    }
  };



  const handleDelete = async (id) => {
    const confirm = window.confirm("คุณแน่ใจว่าต้องการลบกิจกรรมนี้หรือไม่?");
    if (!confirm) return;

    try {
      await axios.delete(`${import.meta.env.VITE_APP_API_BASE_URL}/api/detele-events/${id}`);
      setEvents((prevEvents) => prevEvents.filter((event) => event._id !== id));
    } catch (error) {
      console.error("❌ Error deleting event:", error);
    }
  };
  const handleDeleteAll = async () => {
    const confirm = window.confirm("คุณแน่ใจว่าต้องการลบกิจกรรมทั้งหมดหรือไม่?");
    const userEmail = localStorage.getItem("userEmail");
    if (!confirm) return;

    try {
      await axios.delete(`${import.meta.env.VITE_APP_API_BASE_URL}/api/delete-all-events/${userEmail}`);

      setEvents([]); // ล้าง state
    } catch (error) {
      console.error("❌ Error deleting all events:", error);
    }
  };
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/api/events?email=${user.email}`);
        setEvents(res.data);
      } catch (error) {
        console.error("❌ Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    fetchimage();
  }, []);
  /////aa


  if (loading) return <p className="loading-text">กำลังโหลด...</p>;

  return (
    <div className={`event-container ${isDarkMode ? "dark-mode" : ""}`}>

      {events.length === 0 ? (
        <p className="empty-text">ยังไม่มีกิจกรรม</p>
      ) : (
        <div className="event-list">
          {events.map((event) => (
            <div key={event._id} className="event-card">
              {eventsImage.map((item) => {
                if (event.genre == item.genres) {
                  return (
                    <div key={item._id}>
                      <img className="event-image" src={item.image} alt={item.genres} width="200" />
                    </div>
                  );
                }
                return null;
              })}
              <h3 className="event-name">{event.title}</h3>
              <div className="event-info">
                <p>🎵 genre: {event.genre}</p>
                <p>📍 location: {event.location}</p>
                <p>🗓️ date: {event.date}</p>
              </div>
              <p className="event-description">{event.description}</p>
              <a href={event.link} target="_blank" rel="noopener noreferrer" className="event-link">
                Info more
              </a>
              <button onClick={() => handleDelete(event._id)} className="delete-button">
                🗑️ Delete
              </button>
            </div>
          ))}
          <div className="btn-delete-all">
            <button onClick={handleDeleteAll} className="delete-button-all">
              Delete all
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default EventList;
