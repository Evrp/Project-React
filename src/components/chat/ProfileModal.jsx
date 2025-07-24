import React, { useEffect } from "react";
import { toast } from "react-toastify";
import "./ProfileModal.css";
import axios from "axios";

/**
 * ProfileModal - แสดงข้อมูลผู้ใช้ในรูปแบบ modal
 * @param {Object} props - Props ของ component
 * @param {boolean} props.isOpen - สถานะเปิด/ปิด modal
 * @param {function} props.onClose - ฟังก์ชันเมื่อปิด modal
 * @param {Object} props.user - ข้อมูลผู้ใช้
 * @returns {React.Component} ProfileModal component
 */
const ProfileModal = ({ isOpen, onClose, user, userImage, setFriends }) => {
  const userEmail = localStorage.getItem("userEmail");
  if (!isOpen || !user) return null;

  // Log ค่า user เพื่อ debug
  useEffect(() => {
    if (isOpen && user) {
      console.log("ProfileModal user:", user);
      console.log("PhotoURL:", user.photoURL);
      console.log("userImage:", userImage);
    }
  }, [isOpen, user]);

  const getHighResPhoto = (url) => {
    if (!url) return "/default-profile.png";

    try {
      // ตรวจสอบว่า URL มีรูปแบบที่ต้องการหรือไม่
      if (typeof url === "string" && url.includes("=s")) {
        // รองรับทั้ง ...=s96-c และ ...=s96-c&... หรือ ...=s96-c?... (กรณีมี query string ต่อท้าย)
        return url.replace(/=s\d+-c(?=[&?]|$)/, "=s400-c");
      }
      return url;
    } catch (error) {
      console.error("Error processing photo URL:", error);
      return url || "/default-profile.png";
    }
  };
  const deleteUser = async (roomId, user) => {
    if (!window.confirm("คุณต้องการลบเพื่อนคนนี้หรือไม่?")) return;
    try {
      // ลบผู้ใช้จากเซิร์ฟเวอร์
      if (roomId) {
        await fetch(
          `${
            import.meta.env.VITE_APP_API_BASE_URL
          }/api/delete-event-match/${roomId}`,
          {
            method: "DELETE",
          }
        );
      }
      console.log("ลบผู้ใช้:", user);
      if (user) {
        await axios.delete(
          `${
            import.meta.env.VITE_APP_API_BASE_URL
          }/api/users/${userEmail}/friends/${user}`
        );
      }
      setFriends((prevFriends) =>
        prevFriends.filter((friend) => friend.email !== user)
      );

     

      // แสดงแจ้งเตือนสำเร็จ
      toast.success("ลบผู้ใช้สำเร็จ");

      // ปิด modal
      onClose();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("เกิดข้อผิดพลาดในการลบผู้ใช้");
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-body">
          <div className="profile-modal-user">
            <img
              src={getHighResPhoto(
                user.photoURL || userImage?.photoURL || "/default-profile.png"
              )}
              alt={userImage?.displayName || "ผู้ใช้"}
              className="profile-modal-avatar"
            />
            <div className="profile-modal-name">
              {userImage?.displayName || "ไม่มีชื่อ"}
            </div>
            <div className="profile-modal-email">{userImage?.email || ""}</div>
          </div>

          <button
            className="modal-profile"
            onClick={() => deleteUser(userImage.roomId, userImage.email)}
          >
            ลบเพื่อน
          </button>
          {/* ข้อมูลเพิ่มเติม (ถ้ามี) */}
          {/* {(user?.bio || user?.location || user?.education || user?.work) && (
                        <div className="profile-modal-info">
                            {user?.bio && (
                                <div className="profile-modal-info-item">
                                    <div className="profile-modal-info-label">เกี่ยวกับ</div>
                                    <div className="profile-modal-info-value">{user.bio}</div>
                                </div>
                            )}

                            {user?.location && (
                                <div className="profile-modal-info-item">
                                    <div className="profile-modal-info-label">ที่อยู่</div>
                                    <div className="profile-modal-info-value">{user.location}</div>
                                </div>
                            )}

                            {user?.education && (
                                <div className="profile-modal-info-item">
                                    <div className="profile-modal-info-label">การศึกษา</div>
                                    <div className="profile-modal-info-value">{user.education}</div>
                                </div>
                            )}

                            {user?.work && (
                                <div className="profile-modal-info-item">
                                    <div className="profile-modal-info-label">อาชีพ</div>
                                    <div className="profile-modal-info-value">{user.work}</div>
                                </div>
                            )}
                        </div>
                    )} */}

          {/* <div className="profile-modal-actions">
            <button className="profile-modal-button primary">
              <span className="emoji">💬</span>
              ส่งข้อความ
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
