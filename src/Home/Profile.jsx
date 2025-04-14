import React, { useState, useContext } from "react";
import "./Profile.css";
import { Button, Input, Select } from "@/components/ui";
import { EventContext } from "../context/eventcontext.jsx";
import { useNavigate } from "react-router-dom";

const interests = ["คอนเสิร์ต", "กีฬา", "เพลง", "ศิลปิน"];
const genreOptions = ["Pop", "Rock", "Jazz", "Classical", "Hip-Hop"];

const Profile = () => {
  const userName = localStorage.getItem("userName");
  const userPhoto = localStorage.getItem("userPhoto");
  // const userEmail = localStorage.getItem("userEmail");

  const navigate = useNavigate();
  const { setEvents } = useContext(EventContext);

  const [formData, setFormData] = useState({
    interest: "",
    location: "",
    date: "",
    budget: "",
  });

  const [editing, setEditing] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const toggleGenre = (genre) => {
    setSelectedGenres((prevGenres) =>
      prevGenres.includes(genre)
        ? prevGenres.filter((g) => g !== genre)
        : [...prevGenres, genre]
    );
  };

  const handleEditOrSave = async () => {
    const email = localStorage.getItem("userEmail"); // ✅ ดึงอีเมลที่นี่
  
    if (editing) {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      localStorage.setItem("selectedGenres", JSON.stringify(selectedGenres));
  
      if (!email) {
        console.error("ไม่พบอีเมลผู้ใช้");
        return;
      }else{
        console.log("อีเมลผู้ใช้:", email);
      }
  
      try {
        const response = await fetch("http://localhost:8080/api/update-genres", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            genres: selectedGenres,
          }),
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log("🎶 อัปเดตแนวเพลงสำเร็จ:", data);
        } else {
          console.error("❌ เกิดข้อผิดพลาดในการบันทึกแนวเพลง");
        }
      } catch (error) {
        console.error("🚨 เกิดข้อผิดพลาด:", error);
      }
    }
  
    setEditing(!editing);
  };
  

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const amazonResponse = await fetch("http://localhost:8080/api/scrape-amazon");
  //     const amazonData = await amazonResponse.json();
  //     console.log("✨ ข้อมูล Amazon:", amazonData);

  //     const payload = {
  //       userData: formData,
  //       amazonData: amazonData,
  //     };

  //     const makeResponse = await fetch("http://localhost:8080/api/send-to-make-combined", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });

  //     console.log("✅ ตอบกลับจาก Make.com:", await makeResponse.json());

  //     setEvents([amazonData]);
  //     navigate("/home");
  //   } catch (error) {
  //     console.error("🚨 เกิดข้อผิดพลาดขณะดึงข้อมูล:", error);
  //   }
  // };

  if (!userName || !userPhoto) {
    return (
      <div className="container-profile">
        <div className="text-center mt-8">
          <h2 className="text-xl font-semibold">กรุณาเข้าสู่ระบบก่อนดูโปรไฟล์</h2>
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
        <h2>{`🎉 Welcome, ${userName}`}</h2>

        <div className="info-wrapper">
          <div className="info-box">
            <h3>ข้อมูล</h3>
            {editing ? (
              <>
                <div className="flex flex-wrap gap-2 mt-4">
                  {genreOptions.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`genre-button ${selectedGenres.includes(genre) ? "selected" : ""}`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-4">
                <p>{selectedGenres.length > 0 ? selectedGenres.join(", ") : "ยังไม่ได้เลือกแนวเพลง"}</p>
              </div>
            )}
            <Button onClick={handleEditOrSave} className="mt-4">
              {editing ? "💾 บันทึก" : "✏️ แก้ไข"}
            </Button>
          </div>

          <div className="info-box">
            <h3>คำอธิบาย</h3>
            {editing ? (
              <textarea
                name="description"
                value={userInfo.description}
                onChange={handleInputChange}
              />
            ) : (
              <p>{userInfo.description}</p>
            )}
          </div>

          <div className="info-box">
            <h3>ข้อมูลเพิ่มเติม</h3>
            {editing ? (
              <textarea
                name="extra"
                value={userInfo.extra}
                onChange={handleInputChange}
              />
            ) : (
              <p>{userInfo.extra}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
