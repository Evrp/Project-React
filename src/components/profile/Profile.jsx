import React, { useState, useContext, useEffect } from "react";
import "./Profile.css";
import { Button } from "@/components/ui";
import { EventContext } from "../../context/eventcontext.jsx";
import { useNavigate } from "react-router-dom";

const genreOptions = [
  "Arts",
  "Movie",
  "Music",
  "Party",
  "Concert",
  "Golf",
  "Snooker",
  "Football",
  "Muaythai",
  "Book",
  "Game",
  "Food",
  "Vocal",
];

const Profile = () => {
  const userName = localStorage.getItem("userName");
  const userPhoto = localStorage.getItem("userPhoto");
  const navigate = useNavigate();
  const { setEvents } = useContext(EventContext);
  const [originalGenres, setOriginalGenres] = useState([]);

  const [selectedGenres, setSelectedGenres] = useState(
    JSON.parse(localStorage.getItem("selectedGenres")) || []
  );

  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("userInfo")) || {
      detail: "รายละเอียดข้อมูลของผู้ใช้ที่น่าสนใจ...",
      description: "คำอธิบายเกี่ยวกับโปรไฟล์แบบกระชับและน่ารู้...",
      extra: "รายละเอียดอื่น ๆ ที่น่าสนใจเพิ่มเติม...",
    }
  );

  const [editingGenres, setEditingGenres] = useState(false);
  const [editingField, setEditingField] = useState(null); // ช่องที่กำลังแก้ไข

  const [tempInfo, setTempInfo] = useState({ ...userInfo }); // เก็บค่าที่แก้ไว้ชั่วคราว

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveInfo = () => {
    setUserInfo(tempInfo);
    localStorage.setItem("userInfo", JSON.stringify(tempInfo));
    setEditingField(null);
  };
  const handleEditGenres = async () => {
    const email = localStorage.getItem("userEmail");

    if (!email) {
      console.error("ไม่พบอีเมลผู้ใช้");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/update-genres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, genres: selectedGenres }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("🎶 อัปเดตแนวเพลงสำเร็จ:", data);
        localStorage.setItem("selectedGenres", JSON.stringify(selectedGenres));
      } else {
        console.error("❌ เกิดข้อผิดพลาดในการบันทึกแนวเพลง");
      }
    } catch (error) {
      console.error("🚨 เกิดข้อผิดพลาด:", error);
    }

    setEditingGenres(false);
  };

  if (!userName || !userPhoto) {
    return (
      <div className="container-profile">
        <div className="text-center mt-8">
          <h2 className="text-xl font-semibold">
            กรุณาเข้าสู่ระบบก่อนดูโปรไฟล์
          </h2>
          <Button className="mt-4" onClick={() => navigate("/login")}>
            ไปหน้าเข้าสู่ระบบ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-profile">
      <div className="profile-container">
        <img src={userPhoto} alt="Profile" className="profile-image" />
        <h2>{`${userName}`}</h2>

        <div className="info-wrapper">
          {/* 📝 ช่องข้อมูล */}
          <div className="info-box">
            <h3>About Me</h3>
            {editingField === "detail" ? (
              <textarea
                name="detail"
                value={tempInfo.detail}
                onChange={handleInputChange}
                rows={3}
              />
            ) : (
              <p
                onClick={() => {
                  setEditingField("detail");
                  setTempInfo({ ...userInfo });
                }}
              >
                {userInfo.detail}
              </p>
            )}
            {/* ✅ ปุ่มบันทึก */}
            {editingField && (
              <div className="save-button-container">
                <Button onClick={handleSaveInfo} className="save-button">
                  แก้ไขรายละเอียด
                </Button>
              </div>
            )}
          </div>

          {/* 🎵 แนวเพลง */}
          <div className="info-box">
            <h3>Activities</h3>
            {editingGenres ? (
              <div className="filter-genres">
                {genreOptions.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`genre-button ${
                      selectedGenres.includes(genre) ? "selected" : ""
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            ) : (
              <div className="filter-genres">
                {selectedGenres.length > 0 ? (
                  selectedGenres.map((genre) => (
                    <span key={genre} className="genre-button selected">
                      {genre}
                    </span>
                  ))
                ) : (
                  <p>ยังไม่ได้เลือกแนวเพลง</p>
                )}
              </div>
            )}

            <div className="center-wrapper">
              {editingGenres ? (
                <>
                  <Button onClick={handleEditGenres} className="edit-button">
                    บันทึก
                  </Button>
                  {JSON.stringify(originalGenres) !==
                    JSON.stringify(selectedGenres) && (
                    <Button
                      onClick={() => {
                        setSelectedGenres(originalGenres);
                        setEditingGenres(false);
                      }}
                      className="edit-button cancel-button"
                    >
                      ย้อนกลับ
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  onClick={() => {
                    setOriginalGenres([...selectedGenres]);
                    setEditingGenres(true);
                  }}
                  className="edit-button"
                >
                  ✏️ แก้ไข
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
