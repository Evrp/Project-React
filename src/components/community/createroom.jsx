import { useState } from "react";
import axios from "axios";
import { IoMdAddCircle, IoMdCloseCircle } from "react-icons/io";
import { useParams } from "react-router-dom";
import "./createroom.css";
const CreateRoom = ({ onRoomCreated }) => {
  const { roomId } = useParams();
  const [showForm, setShowForm] = useState(false);
  const [roomData, setRoomData] = useState({
    name: "",
    image: "",
    description: "",
  });

  const handleChange = (e) => {
    setRoomData({ ...roomData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const createdBy = localStorage.getItem("userName") || "ไม่ระบุ";
    console.log(roomId);
    try {
      const res = await axios.post("http://localhost:8080/api/createroom", {
        ...roomData,
        createdBy,
        roomId
      });
      onRoomCreated(res.data); // ส่งข้อมูลกลับไปให้ Newcommu แสดงผล
      setRoomData({ name: "", image: "", description: "" });
      setShowForm(false);
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการสร้างห้อง:", err);
    }
  };

  return (
    <div className="create-room-bt">
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? <IoMdCloseCircle /> : <IoMdAddCircle />}
        {showForm ? "ยกเลิก" : "สร้างห้องใหม่"}
      </button>

      {showForm && (
        <div className="popup-overlay" onClick={() => setShowForm(false)}>
          <div className="popup-form" onClick={(e) => e.stopPropagation()}>
            <h3>สร้างห้องใหม่</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                className="commu-input"
                name="name"
                placeholder="ชื่อห้อง"
                value={roomData.name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="image"
                className="commu-input"
                placeholder="ลิงก์รูปภาพห้อง"
                value={roomData.image}
                onChange={handleChange}
              />

              {/* แสดง preview ถ้ามีลิงก์รูป */}
              {roomData.image && (
                <div className="image-preview">
                  <img src={roomData.image} alt="Preview" />
                </div>
              )}

              <textarea
                name="description"
                className="commu-input"
                placeholder="รายละเอียดเพิ่มเติม"
                value={roomData.description}
                onChange={handleChange}
              />
              <button type="submit">ยืนยันสร้างห้อง</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRoom;
