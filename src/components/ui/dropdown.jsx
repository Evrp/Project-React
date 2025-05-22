// components/DropdownMenu.jsx
import React, { useRef, useEffect, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import "../freind/friend.css";

function DropdownMenu({
  user,
  currentUserfollow,
  onProfileClick,
  onFollow,
  fetchFollowInfo,
}) {
  const [openMenu, setOpenMenu] = useState(false);
  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setOpenMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown-wrapper" ref={dropdownRef}>
      <button
        onClick={() => setOpenMenu((prev) => !prev)}
        className="dropdown-toggle"
      >
        <BsThreeDots size={20} />
      </button>

      {openMenu && (
        <div className="dropdown-menu">
          <button
            className="dropdown-item"
            onClick={() => {
              onProfileClick(user);
              fetchFollowInfo(user.email);
              setOpenMenu(false);
            }}
          >
            👤 ดูโปรไฟล์
          </button>

          <button
            className="dropdown-item"
            onClick={() => {
              onFollow(user.email);
            }}
          >
            {Array.isArray(currentUserfollow?.following) &&
            currentUserfollow.following.includes(user.email)
              ? "🔔 กำลังติดตาม"
              : "➕ ติดตาม"}
          </button>
        </div>
      )}
    </div>
  );
}

export default DropdownMenu;
