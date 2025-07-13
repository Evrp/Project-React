import React, { useState, useEffect } from "react";
import "./Profile.css";
import { Button } from "@/components/ui";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { useTheme } from "../../context/themecontext";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const MAX_CHARS = 400;
const MAX_NICKNAME = 30;

const Profile = () => {
  const userPhoto = localStorage.getItem("userPhoto");
  const userEmail = localStorage.getItem("userEmail");
  const displayName = localStorage.getItem("userName");
  const navigate = useNavigate();
   const { isDarkMode, setIsDarkMode } = useTheme();

  // State
  const [originalGenres, setOriginalGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState(
    JSON.parse(localStorage.getItem("selectedGenres")) || []
  );
  const [selectedSubGenres, setSelectedSubGenres] = useState({});
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("userInfo")) || {
      detail: "รายละเอียดข้อมูลของผู้ใช้ที่น่าสนใจ...",
      description: "คำอธิบายเกี่ยวกับโปรไฟล์แบบกระชับและน่ารู้...",
      extra: "รายละเอียดอื่น ๆ ที่น่าสนใจเพิ่มเติม...",
    }
  );
  const [tempInfo, setTempInfo] = useState({ ...userInfo });
  const [nickName, setNickName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingGenres, setEditingGenres] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Validation
  const validateNickname = (name) => {
    if (!name.trim()) return "กรุณากรอกชื่อ";
    if (name.length > MAX_NICKNAME) return `ชื่อยาวเกิน ${MAX_NICKNAME} ตัวอักษร`;
    return "";
  };
  const validateDetail = (text) => {
    if (text.length > MAX_CHARS) return `รายละเอียดเกิน ${MAX_CHARS} ตัวอักษร`;
    return "";
  };

  // Handlers
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
    if (name === "detail" && validateDetail(value)) return;
    setTempInfo((prev) => ({ ...prev, [name]: value }));
  };
  const handleSaveInfo = async () => {
    setLoading(true);
    setError("");
    const email = localStorage.getItem("userEmail");
    if (!email) {
      setError("ไม่พบอีเมลผู้ใช้");
      setLoading(false);
      return;
    }
    if (validateDetail(tempInfo.detail)) {
      setError(validateDetail(tempInfo.detail));
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/save-user-info`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, userInfo: tempInfo }),
        }
      );
      if (response.ok) {
        setUserInfo(tempInfo);
        setEditingField(null);
        toast.success("บันทึกข้อมูลสำเร็จ");
      } else {
        setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        toast.error("บันทึกข้อมูลล้มเหลว");
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดขณะเชื่อมต่อเซิร์ฟเวอร์");
      toast.error("เกิดข้อผิดพลาดขณะเชื่อมต่อเซิร์ฟเวอร์");
    }
    setLoading(false);
  };
  const handleEditGenres = async () => {
    setLoading(true);
    setError("");
    const email = localStorage.getItem("userEmail");
    if (!email) {
      setError("ไม่พบอีเมลผู้ใช้");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/update-genres`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            genres: selectedGenres,
            subGenres: selectedSubGenres,
            updatedAt: new Date().toISOString(),
          }),
        }
      );
      if (response.ok) {
        localStorage.setItem("selectedGenres", JSON.stringify(selectedGenres));
        toast.success("อัปเดตแนวเพลงสำเร็จ");
      } else {
        setError("เกิดข้อผิดพลาดในการบันทึกแนวเพลง");
        toast.error("บันทึกแนวเพลงล้มเหลว");
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดขณะเชื่อมต่อเซิร์ฟเวอร์");
      toast.error("เกิดข้อผิดพลาดขณะเชื่อมต่อเซิร์ฟเวอร์");
    }
    setEditingGenres(false);
    setLoading(false);
  };
  const handleClearGenres = async () => {
    if (!window.confirm("คุณต้องการล้างแนวเพลงทั้งหมดหรือไม่?")) return;
    setLoading(true);
    setError("");
    const email = localStorage.getItem("userEmail");
    if (!email) {
      setError("ไม่พบอีเมลผู้ใช้");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/update-genres`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, genres: [], subGenres: {} }),
        }
      );
      if (response.ok) {
        setSelectedGenres([]);
        setSelectedSubGenres({});
        setOriginalGenres([]);
        localStorage.setItem("selectedGenres", JSON.stringify([]));
        toast.success("ล้างแนวเพลงเรียบร้อย");
      } else {
        setError("ล้างแนวเพลงไม่สำเร็จ");
        toast.error("ล้างแนวเพลงไม่สำเร็จ");
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดขณะเชื่อมต่อเซิร์ฟเวอร์");
      toast.error("เกิดข้อผิดพลาดขณะเชื่อมต่อเซิร์ฟเวอร์");
    }
    setLoading(false);
  };
  const handleChange = (e) => {
    setNickName(e.target.value);
  };
  const handleBlur = async () => {
    const err = validateNickname(nickName);
    if (err) {
      setError(err);
      toast.error(err);
      setIsEditing(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/save-user-name`,
        { userEmail, nickName }
      );
      toast.success("บันทึกชื่อสำเร็จ");
    } catch (err) {
      setError("บันทึก nickname ล้มเหลว");
      toast.error("บันทึก nickname ล้มเหลว");
    }
    setIsEditing(false);
    setLoading(false);
  };
  const handleClick = () => {
    setIsEditing(true);
  };

  // Fetchers
  useEffect(() => {
    setLoading(true);
    setError("");
    const fetchAll = async () => {
      try {
        const [userRes, followRes, nickRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/api/user-info/${encodeURIComponent(userEmail)}`),
          axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/api/user/${encodeURIComponent(userEmail)}/follow-info`),
          axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/api/get-user?email=${userEmail}`),
        ]);
        setUserInfo(userRes.data);
        setTempInfo(userRes.data);
        setFollowers(followRes.data.followers);
        setFollowing(followRes.data.following);
        setNickName(nickRes.data.nickname || "");
      } catch (err) {
        setError("โหลดข้อมูลผู้ใช้ล้มเหลว");
      }
      setLoading(false);
    };
    if (userEmail) fetchAll();
  }, [userEmail]);
  useEffect(() => {
    console.log("user Photo:", userPhoto);
  }, []);

  // UI
  if (!userEmail || !userPhoto) {
    return (
      <div className="container-profile">
        <div className="text-center mt-8">
          <h2 className="text-xl font-semibold">กรุณาเข้าสู่ระบบก่อนดูโปรไฟล์</h2>
          <Button className="mt-4" onClick={() => navigate("/login")}>ไปหน้าเข้าสู่ระบบ</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container-profile ${isDarkMode ? "dark-mode" : ""}`}>
      <ToastContainer />
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
              onBlur={handleBlur}
              autoFocus
              maxLength={MAX_NICKNAME}
              aria-label="ชื่อเล่น"
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
            <span style={{ fontSize: "30px", fontWeight: "600" }}>{nickName || displayName}</span>
          )}
          <FaEdit
            onClick={handleClick}
            className="edit-icon"
            style={{ cursor: "pointer", fontSize: "24px" }}
            title="แก้ไขชื่อ"
            aria-label="แก้ไขชื่อ"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") handleClick(); }}
          />
        </h2>
        <div className="tabs">
          <ul className="followers"><li>{followers.length} followers</li></ul>
          <ul className="following"><li>{following.length} following</li></ul>
        </div>
        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading-message">Loading...</div>}
        <div className="info-wrapper">
          {/* About Me */}
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
                  maxLength={MAX_CHARS}
                  aria-label="รายละเอียด"
                />
                <p className="word-limit-info">
                  {tempInfo.detail.length} / {MAX_CHARS} ตัวอักษร
                </p>
              </div>
            ) : (
              <p
                onClick={() => {
                  setEditingField("detail");
                  setTempInfo({ ...userInfo });
                }}
                style={{ color: !userInfo.detail ? "#999" : "inherit" }}
                tabIndex={0}
                aria-label="แก้ไขรายละเอียด"
                onKeyDown={(e) => { if (e.key === "Enter") { setEditingField("detail"); setTempInfo({ ...userInfo }); } }}
              >
                {userInfo.detail || "รายละเอียดข้อมูลของผู้ใช้ที่น่าสนใจ...."}
              </p>
            )}
            {editingField && (
              <div className="save-button-container">
                <Button onClick={handleSaveInfo} className="save-button" disabled={loading}>
                  บันทึก
                </Button>
                <Button onClick={() => setEditingField(null)} className="edit-button-cancel-button" disabled={loading}>
                  ยกเลิก
                </Button>
              </div>
            )}
          </div>
          {/* Activities */}
          <div className="info-box">
            <h3>Activities</h3>
            {editingGenres ? (
              <>
                <div className="filter-genres">
                  {genreOptions.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`genre-button ${selectedGenres.includes(genre) ? "selected" : ""}`}
                      aria-pressed={selectedGenres.includes(genre)}
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
                    <span key={genre} className="genre-button selected">{genre}</span>
                  ))
                ) : (
                  <p>ยังไม่ได้เลือกแนวเพลง</p>
                )}
              </div>
            )}
            <div className="center-wrapper">
              {editingGenres ? (
                <>
                  {selectedGenres.length > 0 &&
                    JSON.stringify(originalGenres) !== JSON.stringify(selectedGenres) && (
                      <Button onClick={handleEditGenres} className="edit-button" disabled={loading}>
                        Save
                      </Button>
                    )}
                  <Button onClick={handleClearGenres} className="edit-button-cancel-button" disabled={loading}>
                    Clear All
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedGenres(originalGenres);
                      setEditingGenres(false);
                    }}
                    className="edit-button-cancel-button"
                    disabled={loading}
                  >
                    Back
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setOriginalGenres([...selectedGenres]);
                    setEditingGenres(true);
                  }}
                  className="edit-button"
                  disabled={loading}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
          {editingGenres && (
            <div className="info-box">
              {/* Subgenre Filters */}
              {selectedGenres.map(
                (genre) =>
                  genreSubOptions[genre] && (
                    <div key={`sub-${genre}`} className="subgenre-container">
                      <button className="genreshow-button" tabIndex={-1}>
                        <h4>{genre} :</h4>
                      </button>
                      <div className="filter-subgenres">
                        {genreSubOptions[genre].map((sub) => (
                          <button
                            key={sub}
                            onClick={() => toggleSubGenre(genre, sub)}
                            className={`subgenre-button ${selectedSubGenres[genre]?.includes(sub) ? "selected" : ""}`}
                            aria-pressed={selectedSubGenres[genre]?.includes(sub)}
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
