import React, { useState, useContext } from "react";
import "./Profile.css";
import { Button, Input, Select } from "@/components/ui";
import { EventContext } from "../context/eventcontext.jsx";
import { useNavigate } from "react-router-dom";

const interests = ["คอนเสิร์ต", "กีฬา", "เพลง", "ศิลปิน"];

const Profile = () => {
  const userName = localStorage.getItem("userName");
  const userPhoto = localStorage.getItem("userPhoto");

  const navigate = useNavigate();
  const { setEvents } = useContext(EventContext);

  const [formData, setFormData] = useState({
    interest: "",
    location: "",
    date: "",
    budget: "",
  });

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
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
              {editing ? "💾 บันทึก" : "✏️ แก้ไข"}
            </Button>
          </div>

          <div className="info-box">
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
      </div>
    </div>
  );
};

export default Profile;
