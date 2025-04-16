import React, { useEffect, useState } from "react";
import axios from "axios";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/events");
        setEvents(res.data);
      } catch (error) {
        console.error("❌ Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <p className="text-center text-gray-600 mt-10">กำลังโหลด...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h2 className="">
        🎤 กิจกรรมที่น่าสนใจ
      </h2>
      {events.length === 0 ? (
        <p className="text-center text-gray-500">ยังไม่มีกิจกรรม</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-5"
            >
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-48 object-cover rounded-xl mb-3"
              />
              <h3 className="text-lg font-bold text-gray-900 mb-1 bg-white p-2 rounded">
                {event.title}
              </h3>
              <p className="text-sm text-gray-500 mb-1">{event.genre}</p>
              <p className="text-sm text-gray-700 mb-1">{event.location}</p>
              <p className="text-sm text-gray-700 mb-2">{event.date}</p>
              <p className="text-sm text-gray-600 mb-3">
                {event.description}
              </p>
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                ดูรายละเอียดเพิ่มเติม
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
