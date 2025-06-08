import React, { useState, useEffect } from "react";
import "./Profile.css";
import { Button } from "@/components/ui";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import axios from "axios";

const genreOptions = [
  "Music",
  "Sport",
  "Game",
  "Movie",
  "Book",
  "Exihibition",
  "Food",
  "Health",
  "Art",
  "Travel",
];
const genreSubOptions = {
  Music: ["Pop", "Rock", "Indie", "Jazz", "Hip-Hop"],
  Sport: ["Football", "Basketball", "Snooker", "Boxing"],
  Game: ["PC", "Console", "Mobile", "Board Game"],
  Movie: ["Action", "Romance", "Sci-Fi", "Drama"],
  Book: ["Fiction", "Non-fiction", "Fantasy", "Self-help"],
  Exihibition: ["Museum", "Gallery", "Design", "Startup"],
  Food: ["Street Food", "Fine Dining", "Vegan", "Dessert"],
  Health: ["Yoga", "Fitness", "Meditation", "Wellness"],
  Art: ["Painting", "Photography", "Sculpture", "Digital"],
  Travel: ["Adventure", "Beach", "Mountain", "City"],
};

const Profile = () => {
  // const userName = localStorage.getItem("userName");
  const userPhoto = localStorage.getItem("userPhoto");
  const userEmail = localStorage.getItem("userEmail");
  const displayName = localStorage.getItem("userName");
  const navigate = useNavigate();
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
  const [nickName, setNickName] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingGenres, setEditingGenres] = useState(false);
  const [editingField, setEditingField] = useState(null); // ช่องที่กำลังแก้ไข
  const [selectedSubGenres, setSelectedSubGenres] = useState({});
  const [tempInfo, setTempInfo] = useState({ ...userInfo }); // เก็บค่าที่แก้ไว้ชั่วคราว

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const toggleSubGenre = (genre, subGenre) => {
    setSelectedSubGenres((prev) => {
      const current = prev[genre] || [];
      const updated = current.includes(subGenre)
        ? current.filter((s) => s !== subGenre)
        : [...current, subGenre];
      return { ...prev, [genre]: updated };
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const wordCount = value.trim().split(/\s+/).length;
    if (wordCount > 400) return; // ถ้ามากกว่า 400 คำ จะไม่อัปเดตค่า

    setTempInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveInfo = async () => {
    const email = localStorage.getItem("userEmail");

    if (!email) {
      console.error("❌ ไม่พบอีเมลผู้ใช้");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/save-user-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userInfo: tempInfo }),
      });

      if (response.ok) {
        console.log("tempInfo", tempInfo);
        setUserInfo(tempInfo);
        setEditingField(null);
        console.log("✅ บันทึกข้อมูลสำเร็จ");
      } else {
        console.error("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("🚨 Error:", error);
    }
  };
  useEffect(() => {
    const savedNickName = localStorage.getItem("nickName");
    if (savedNickName) {
      setNickName(savedNickName);
    }
  }, []);

  const fetchUserInfo = async () => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;

    try {
      const email = encodeURIComponent(userEmail);

      const res = await axios.get(
        `http://localhost:8080/api/user-info/${email}`
      );

      const data = res.data;
      console.log("data", data);
      setUserInfo(data);
      setTempInfo(data); // ตั้งค่าช่วงแก้ไขให้เหมือนกัน
    } catch (err) {
      console.error("❌ ดึงข้อมูล userInfo ไม่สำเร็จ:", err);
    }
  };

  const handleEditGenres = async () => {
    const email = localStorage.getItem("userEmail");

    if (!email) {
      console.error("ไม่พบอีเมลผู้ใช้");
      return;
    }

    try {
      console.log(selectedSubGenres);
      const response = await fetch("http://localhost:8080/api/update-genres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          genres: selectedGenres,
          subGenres: selectedSubGenres,
          updatedAt: new Date().toISOString(),
        }),
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

  const handleClearGenres = async () => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      console.error("ไม่พบอีเมลผู้ใช้");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/update-genres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          genres: [], // ล้าง genres
          subGenres: {}, // ล้าง subGenres ด้วย
        }),
      });

      if (response.ok) {
        console.log("🧹 ล้างแนวเพลงทั้งหมดเรียบร้อย");
        setSelectedSubGenres({});
        setSelectedGenres([]);
        localStorage.setItem("selectedGenres", JSON.stringify([]));
      } else {
        console.error("❌ ล้างแนวเพลงไม่สำเร็จ");
      }
    } catch (error) {
      console.error("🚨 เกิดข้อผิดพลาด:", error);
    }
  };
  const handleChange = (e) => {
    setNickName(e.target.value);
  };
  const handleBlur = async () => {

    try {
      await axios.post("http://localhost:8080/api/save-user-name", {
        userEmail,
        nickName,
      });


    } catch (err) {
      console.error("บันทึก nickname ล้มเหลว:", err);
    }
    setIsEditing(false);
  };
  const handleClick = () => {
    setIsEditing(true);
  };

  if (!userEmail || !userPhoto) {
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
  useEffect(() => {
    const fetchFollowInfo = async () => {
      try {
        const encodedEmail = encodeURIComponent(userEmail);
        const res = await axios.get(
          `http://localhost:8080/api/user/${encodedEmail}/follow-info`
        );

        setFollowers(res.data.followers);
        setFollowing(res.data.following);
      } catch (error) {
        console.error("Error fetching follow info:", error);
      }
    };

    if (userEmail) {
      fetchFollowInfo();
    }
  }, [userEmail]);
  ///////////show user info//////////
  useEffect(() => {
    fetchUserInfo();
    console.log("userInfo", userInfo);
  }, []);
  useEffect(() => {
    const fetchNickname = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/get-user?email=${userEmail}`
        );
        setNickName(res.data.nickname || ""); // กำหนดชื่อที่ได้มาจาก backend
      } catch (err) {
        console.error("โหลด nickname ล้มเหลว:", err);
      }
    };

    fetchNickname();
  }, [userEmail]);


  return (
    <div className="container-profile">
      <div className="text-xl-font-semibold">
        <h1>Profile</h1>
      </div>
      <div className="profile-container">
        <img src={userPhoto} alt="Profile" className="profile-image" />
        <h4>{userEmail}</h4>
        <h2>
          {isEditing ? (
            <input
              type="text"
              value={nickName}
              onChange={handleChange}
              onBlur={handleBlur} // เมื่อผู้ใช้หยุดพิมพ์และคลิกออก จะบันทึก
              autoFocus
              placeholder="ใส่ชื่อของคุณ"
              style={{
                fontSize: "30px",
                fontWeight: "600",
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                textAlign: "center",
              }}
            />
          ) : (
            <span style={{ fontSize: "30px", fontWeight: "600" }}>
              {nickName || displayName}
            </span>
          )}

          <FaEdit
            onClick={handleClick}
            className="edit-icon"
            style={{ cursor: "pointer", fontSize: "24px" }}
            title="แก้ไขชื่อ"
          />
        </h2>
        <div>
          <div className="tabs">
            <ul className="followers">
              <li>{followers.length} followers</li>
            </ul>
            <ul className="following">
              <li>{following.length} following</li>
            </ul>
          </div>
        </div>

        <div className="info-wrapper">
          {/* 📝 ช่องข้อมูล */}
          <div className="info-box">
            <h3>About Me</h3>
            {editingField === "detail" ? (
              <div>
                <textarea
                  name="detail"
                  value={tempInfo.detail}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="รายละเอียดข้อมูลของผู้ใช้ที่น่าสนใจ...."
                  maxLength={400}
                />
                <p className="word-limit-info">
                  {tempInfo.detail.trim().length} / 400
                </p>
              </div>
            ) : (
              <p
                onClick={() => {
                  setEditingField("detail");
                  setTempInfo({ ...userInfo });
                }}
                style={{ color: !userInfo.detail ? "#999" : "inherit" }} // สีเทาถ้าไม่มีข้อความ
              >
                {userInfo.detail || "รายละเอียดข้อมูลของผู้ใช้ที่น่าสนใจ...."}
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
              <>
                <div className="filter-genres">
                  {genreOptions.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`genre-button ${selectedGenres.includes(genre) ? "selected" : ""
                        }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </>
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
                        className="edit-button-cancel-button"
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
              {editingGenres && (
                <Button
                  onClick={handleClearGenres}
                  className="edit-button-cancel-button"
                >
                  ล้างแนวเพลงทั้งหมด
                </Button>
              )}
            </div>
          </div>
          {editingGenres && (
            <div className="info-box">
              {/* 🔽 Subgenre Filters */}
              {selectedGenres.map(
                (genre) =>
                  genreSubOptions[genre] && (
                    <div key={`sub-${genre}`} className="subgenre-container">
                      <button className="genreshow-button">
                        <h4>{genre} :</h4>
                      </button>
                      <div className="filter-subgenres">
                        {genreSubOptions[genre].map((sub) => (
                          <button
                            key={sub}
                            onClick={() => toggleSubGenre(genre, sub)}
                            className={`subgenre-button ${selectedSubGenres[genre]?.includes(sub)
                              ? "selected"
                              : ""
                              }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
