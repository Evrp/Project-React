import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "./firebase/Authcontext";
import { FaUsers, FaUser, FaUserFriends, FaCog } from "react-icons/fa";

const Navbar = () => {
  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);
  const { user, logout } = useAuth();
  const handleLogout = async () => {
    if (user && user.email) {
      try {
        // เรียก API เพื่อลบข้อมูลใน MongoDB
        await fetch("http://localhost:8080/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.email }),
        });

        // ลบ localStorage
        localStorage.removeItem("userName");
        localStorage.removeItem("userPhoto");

        // logout จาก Firebase context
        logout();
      } catch (error) {
        console.error("❌ Logout failed:", error);
      }
    }
    closeMobileMenu();
  };

  return (
    <div className="navbar-con">
      <div className="logo-con">
        <Link to="/home">
          <h3>Find</h3>
          <h3>Friend</h3>
        </Link>
      </div>

      <ul className={click ? "menu active" : "menu-bar"}>
        <Link to="/community" onClick={closeMobileMenu} className="menu-link">
          <li>
            <FaUsers className="icon" />
            <span>Community</span>
          </li>
        </Link>

        <Link to="/profile" onClick={closeMobileMenu} className="menu-link">
          <li>
            <FaUser className="icon" />
            <span>Profile</span>
          </li>
        </Link>

        <Link to="/friend" onClick={closeMobileMenu} className="menu-link">
          <li>
            <FaUserFriends className="icon" />
            <span>Friend</span>
          </li>
        </Link>

        <Link to="/setup" onClick={closeMobileMenu} className="menu-link">
          <li>
            <FaCog className="icon" />
            <span>Setup</span>
          </li>
        </Link>

        {user ? (
          <li className="menu-link" onClick={handleLogout}>
            <span className="logout-link">LOGOUT</span>
          </li>
        ) : (
          <Link to="/login" onClick={closeMobileMenu} className="menu-link">
            <li>
              <span>LOGIN</span>
            </li>
          </Link>
        )}
      </ul>

      <div className="mobile-menu" onClick={handleClick}>
        {click ? <FiX /> : <FiMenu />}
      </div>
    </div>
  );
};

export default Navbar;
