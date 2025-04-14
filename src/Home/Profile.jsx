import React, { useState, useContext } from "react";
import "./Profile.css";
import { Button, Input, Select } from "@/components/ui";
import { EventContext } from "../context/eventcontext.jsx";
import { useNavigate } from "react-router-dom";

const interests = ["คอนเสิร์ต", "กีฬา", "เพลง", "ศิลปิน"];
<<<<<<< HEAD
const genreOptions = ["Pop", "Rock", "Jazz", "Classical", "Hip-Hop"];
=======
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697

const Profile = () => {
  const userName = localStorage.getItem("userName");
  const userPhoto = localStorage.getItem("userPhoto");
<<<<<<< HEAD
  // const userEmail = localStorage.getItem("userEmail");
=======
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697

  const navigate = useNavigate();
  const { setEvents } = useContext(EventContext);

  const [formData, setFormData] = useState({
    interest: "",
    location: "",
    date: "",
    budget: "",
  });

<<<<<<< HEAD
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
=======
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const toggleEdit = () => {
    setEditing(!editing);
  };

  const [editing, setEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    detail: "รายละเอียดข้อมูลของผู้ใช้ที่น่าสนใจ...",
    description: "คำอธิบายเกี่ยวกับโปรไฟล์แบบกระชับและน่ารู้...",
    extra: "รายละเอียดอื่น ๆ ที่น่าสนใจเพิ่มเติม...",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const amazonResponse = await fetch(
        "http://localhost:8080/api/scrape-amazon"
      );
      const amazonData = await amazonResponse.json();
      console.log("✨ ข้อมูล Amazon:", amazonData);

      const payload = {
        userData: formData,
        amazonData: amazonData,
      };

      const makeResponse = await fetch(
        "http://localhost:8080/api/send-to-make-combined",
        {
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
<<<<<<< HEAD
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

=======
          body: JSON.stringify(payload),
        }
      );

      console.log("✅ ตอบกลับจาก Make.com:", await makeResponse.json());

      // ส่งข้อมูลไปยัง Context
      setEvents([amazonData]);

      // เปลี่ยนหน้าไป Home
      navigate("/home");
    } catch (error) {
      console.error("🚨 เกิดข้อผิดพลาดขณะดึงข้อมูล:", error);
    }
  };

  // ✅ ตรวจสอบว่า login อยู่ไหม
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
  if (!userName || !userPhoto) {
    return (
      <div className="container-profile">
        <div className="text-center mt-8">
<<<<<<< HEAD
          <h2 className="text-xl font-semibold">กรุณาเข้าสู่ระบบก่อนดูโปรไฟล์</h2>
=======
          <h2 className="text-xl font-semibold">
            กรุณาเข้าสู่ระบบก่อนดูโปรไฟล์
          </h2>
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
          <Button className="mt-4" onClick={() => navigate("/login")}>
            ไปหน้าเข้าสู่ระบบ
          </Button>
        </div>
      </div>
    );
  }

<<<<<<< HEAD
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
=======
  if (editing) {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  }
  

  return (
    <div className="container-profile">
      <div className="profile-container">
        {/* รูปโปรไฟล์จาก Google */}
        <img src={userPhoto} alt="Profile" className="profile-image" />
        <h2>{userName ? `🎉 Welcome, ${userName}` : "Profile Another"}</h2>

        {/* ข้อมูลโปรไฟล์ */}
        <div className="info-wrapper">
          <div className="mt-4">
            <Button onClick={toggleEdit}>
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
              {editing ? "💾 บันทึก" : "✏️ แก้ไข"}
            </Button>
          </div>

          <div className="info-box">
<<<<<<< HEAD
=======
            <h3>ข้อมูล</h3>
            {editing ? (
              <textarea
                name="detail"
                value={userInfo.detail}
                onChange={handleInputChange}
              />
            ) : (
              <p>{userInfo.detail}</p>
            )}
          </div>
          <div className="info-box">
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
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
<<<<<<< HEAD

=======
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
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
<<<<<<< HEAD
=======

        {/* แบบฟอร์มค้นหากิจกรรม */}
        {/* <div className="form-section mt-8 bg-white p-4 rounded-xl shadow-md">
          <form onSubmit={handleSubmit}>
            <Select name="interest" onChange={handleChange} required>
              <option value="">เลือกความสนใจ</option>
              {interests.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Input
              name="location"
              placeholder="จังหวัด"
              onChange={handleChange}
              required
            />
            <Input type="date" name="date" onChange={handleChange} required />
            <Input
              name="budget"
              type="number"
              placeholder="งบประมาณ"
              onChange={handleChange}
              required
            />
            <Button type="submit" className="mt-4 w-full">
              🔍 ค้นหากิจกรรม
            </Button>
          </form>
        </div> */}
>>>>>>> 6f3a3802bfdad2dcaef48205cba8b3ff5f02c697
      </div>
    </div>
  );
};

export default Profile;
