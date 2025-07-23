import React, { useRef } from "react";
import { useNotifications } from "../../context/notificationContext";
import "./HeaderProfile.css";

/**
 * HeaderProfile - รูปโปรไฟล์และปุ่มแจ้งเตือนที่สามารถใช้ร่วมกันในหลาย component
 * @param {Object} props - Props ของ component
 * @param {string} props.userPhoto - URL ของรูปภาพโปรไฟล์ผู้ใช้
 * @param {boolean} [props.showNotification=true] - แสดงปุ่มการแจ้งเตือนหรือไม่
 * @param {string} [props.className=""] - className เพิ่มเติมสำหรับ container
 * @param {function} [props.customNotificationContent] - ฟังก์ชันที่รับ notifications และ notificationDropdownRef และคืนค่า JSX สำหรับแสดงข้อมูลใน dropdown
 * @param {boolean} [props.useDropdown=false] - แสดง dropdown หรือไม่
 * @param {React.RefObject} [props.bellButtonRef] - Ref สำหรับปุ่มแจ้งเตือน
 * @param {React.RefObject} [props.notificationDropdownRef] - Ref สำหรับ dropdown แจ้งเตือน
 * @param {function} [props.isFriend] - ฟังก์ชันสำหรับตรวจสอบว่าเป็นเพื่อนกันหรือไม่
 * @returns {React.Component} HeaderProfile component
 */
const HeaderProfile = ({ 
  userPhoto,
  showNotification = true,
  className = "",
  customNotificationContent,
  useDropdown = false,
  bellButtonRef: externalBellButtonRef,
  notificationDropdownRef: externalDropdownRef,
  isFriend
}) => {
  // ถ้าไม่มี userPhoto ใช้ default image
  const profileImage = userPhoto || "https://via.placeholder.com/40";
  
  // Local refs ถ้าไม่มี external refs
  const localBellButtonRef = useRef(null);
  const localDropdownRef = useRef(null);
  
  // ใช้ refs จากภายนอกถ้ามี หรือไม่ก็ใช้ local refs
  const bellButtonRef = externalBellButtonRef || localBellButtonRef;
  const notificationDropdownRef = externalDropdownRef || localDropdownRef;
  
  // ใช้ข้อมูลจาก notification context
  const { 
    notifications, 
    showNotificationDropdown, 
    toggleNotificationDropdown,
    markNotificationAsRead,
    clearReadNotifications,
    handleFriendRequestResponse,
    handleDeleteFriendRequest 
  } = useNotifications();

  return (
    <div className={`profile-section ${className}`}>
      {showNotification && (
        <>
          <div className="notification-wrapper">
            <button
              ref={bellButtonRef}
              className="bell-btn"
              aria-label="Notifications"
              onClick={() => toggleNotificationDropdown()}
            >
              <span className="bell-icon">&#128276;</span>
              {notifications && notifications.filter((n) => !n.read).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {useDropdown && showNotificationDropdown && (
              <div
                className="notification-dropdown"
                ref={notificationDropdownRef}
              >
                {customNotificationContent ? (
                  customNotificationContent(notifications, notificationDropdownRef, {
                    markNotificationAsRead,
                    clearReadNotifications,
                    handleFriendRequestResponse,
                    handleDeleteFriendRequest,
                    isFriend
                  })
                ) : (
                  <div className="notification-default">
                    <h3>การแจ้งเตือน</h3>
                    {notifications && notifications.length > 0 ? (
                      <>
                        <div className="notification-header">
                          <button
                            className="clear-read-button"
                            onClick={clearReadNotifications}
                          >
                            ล้างที่อ่านแล้ว
                          </button>
                        </div>
                        <ul className="notification-list">
                          {notifications.map((notif) => (
                            <li
                              key={notif.id}
                              data-notification-id={notif.id}
                              className={`notification-item ${notif.read ? "read" : "unread"}`}
                              onClick={() => markNotificationAsRead(notif.id)}
                            >
                              <img
                                src={notif.from?.photoURL || "https://via.placeholder.com/40"}
                                alt={notif.from?.displayName || "ผู้ใช้"}
                                className="notification-avatar"
                              />
                              <div className="notification-message">
                                <strong>{notif.from?.displayName || "ผู้ใช้"}</strong>
                                {" "}ส่งคำขอเป็นเพื่อน
                              </div>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="no-notifications">ไม่มีการแจ้งเตือนใหม่</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <span className="profile-divider">|</span>
        </>
      )}
      
      <div className="profile-img-wrapper">
        <img src={profileImage} alt="Profile" className="profile-image" />
      </div>
    </div>
  );
};

export default HeaderProfile;
