import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "./firebase/Authcontext";
// import { IoSearch } from "react-icons/io5";
// import { BsPinAngle, BsChatText } from "react-icons/bs";
// import { CgProfile } from "react-icons/cg";
// import { AiOutlineGlobal } from "react-icons/ai";
// import { IoSettingsOutline } from "react-icons/io5";

const Navbar = () => {
  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);
  const { user, logout } = useAuth();

  return (
    // <div className="nav">
    <div className="navbar-con">
      <div className="logo-con">
        <Link to="/home">
          <h3>Find</h3>
          <h3>Friend</h3>
        </Link>
      </div>
      <ul className={click ? "menu active" : "menu-bar"}>
        <li className="menu-link" onClick={closeMobileMenu}>
          <i className="fas fa-users"></i>
          <Link to="/community">Community</Link>
        </li>
        {/* <li className="menu-link" onClick={closeMobileMenu}>
            <BsPinAngle />
            <Link to="/buildCom">Build Community</Link>
          </li> */}
        {/* <li className="menu-link" onClick={closeMobileMenu}>
            <BsChatText />
            <Link to="/chat">Chat</Link>
          </li> */}
        <li className="menu-link" onClick={closeMobileMenu}>
          <i className="fas fa-user"></i>
          <Link to="/profile">Profile</Link>
        </li>
        <li className="menu-link" onClick={closeMobileMenu}>
          <i className="fas fa-user-friends"></i>
          <Link to="/profile">Friend</Link>
        </li>
        {/* <li className="menu-link" onClick={closeMobileMenu}>
            <AiOutlineGlobal />
            <Link to="/newrelease">New Release</Link>
          </li> */}
        <li className="menu-link" onClick={closeMobileMenu}>
          <i className="fas fa-cog"></i>
          <Link to="/setup">Setup</Link>
        </li>
        <li className="menu-link" onClick={closeMobileMenu}>
          {user ? (
            <span className="logout-link" onClick={logout}>
              LOGOUT
            </span>
          ) : (
            <Link to="/login">LOGIN</Link>
          )}
        </li>
      </ul>
      <div className="mobile-menu" onClick={handleClick}>
        {click ? <FiX /> : <FiMenu />}
      </div>
    </div>
    // </div>
  );
};
export default Navbar;
