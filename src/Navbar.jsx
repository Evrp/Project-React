import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "./firebase/Authcontext";
import { FaUsers, FaUser, FaUserFriends, FaCog } from "react-icons/fa";
import { BsFillChatLeftDotsFill } from "react-icons/bs";

const Navbar = () => {
  const [click, setClick] = useState(false);
  const location = useLocation(); // <-- ตรงนี้สำคัญ!
  const { user, logout } = useAuth();

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const handleLogout = async () => {
    if (user && user.email) {
      try {
        await fetch("http://localhost:8080/api/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });

        localStorage.removeItem("userName");
        localStorage.removeItem("userPhoto");
        logout();
      } catch (error) {
        console.error("❌ Logout failed:", error);
      }
    }
    closeMobileMenu();
  };

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <div className="navbar-con">
      <div className="logo-con">
        <Link to="/home">
          <h3>Find</h3>
          <h3>Friend</h3>
        </Link>
      </div>

      <ul className={click ? "menu active" : "menu-bar"}>
        <Link to="/community" onClick={closeMobileMenu} className={`menu-link ${isActive("/community")}`}>
          <li>
            <FaUsers className="icon" />
            <span>Community</span>
          </li>
        </Link>

        <Link to="/profile" onClick={closeMobileMenu} className={`menu-link ${isActive("/profile")}`}>
          <li>
            <FaUser className="icon" />
            <span>Profile</span>
          </li>
        </Link>

        <Link to="/friend" onClick={closeMobileMenu} className={`menu-link ${isActive("/friend")}`}>
          <li>
            <FaUserFriends className="icon" />
            <span>Friend</span>
          </li>
        </Link>

        <Link to="/chat" onClick={closeMobileMenu} className={`menu-link ${isActive("/setup")}`}>
          <li>
          <BsFillChatLeftDotsFill className="icon"/>
            <span>Chat</span>
          </li>
        </Link>
        <Link to="/setup" onClick={closeMobileMenu} className={`menu-link ${isActive("/setup")}`}>
          <li>
            <FaCog className="icon" />
            <span>Setup</span>
          </li>
        </Link>

        {user ? (
          <li className="logout-link" onClick={handleLogout}>
            <span>LOGOUT</span>
          </li>
        ) : (
          <Link to="/login" onClick={closeMobileMenu} className={`menu-link ${isActive("/login")}`}>
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
