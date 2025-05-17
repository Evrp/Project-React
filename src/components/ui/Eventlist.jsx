import React, { useEffect, useState } from "react";
import axios from "axios";
import "../ui/Eventlist.css";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem("userEmail");
  const user = { email };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/events?email=${user.email}`);
        setEvents(res.data);
      } catch (error) {
        console.error("❌ Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("คุณแน่ใจว่าต้องการลบกิจกรรมนี้หรือไม่?");
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:8080/api/detele-events/${id}`);
      setEvents((prevEvents) => prevEvents.filter((event) => event._id !== id));
    } catch (error) {
      console.error("❌ Error deleting event:", error);
    }
  };

  if (loading) return <p className="loading-text">กำลังโหลด...</p>;

  return (
    <div className="event-container">
      <h2 className="event-title">🎤 กิจกรรมที่น่าสนใจ</h2>

      {events.length === 0 ? (
        <p className="empty-text">ยังไม่มีกิจกรรม</p>
      ) : (
        <div className="event-list">
          {events.map((event) => (
            <div key={event._id} className="event-card">
              <img src={event.imageUrl} alt={event.title} className="event-image" />
              <h3 className="event-name">{event.title}</h3>
              <div className="event-info">
                <p>🎵 หมวดหมู่: {event.genre}</p>
                <p>📍 สถานที่: {event.location}</p>
                <p>🗓️ วันที่: {event.date}</p>
              </div>
              <p className="event-description">{event.description}</p>
              <a href={event.link} target="_blank" rel="noopener noreferrer" className="event-link">
                ดูรายละเอียดเพิ่มเติม
              </a>
              <button onClick={() => handleDelete(event._id)} className="delete-button">
                🗑️ ลบกิจกรรม
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
