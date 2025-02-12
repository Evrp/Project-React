import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { IoSearch } from "react-icons/io5";
import { BsPinAngle, BsChatText } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import { AiOutlineGlobal } from "react-icons/ai";
import { IoSettingsOutline } from "react-icons/io5";

const Navbar = () => {
  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  return (
    <div className="navbar">
      <div className="nav-container">
        <div className="navbar-con">
          <div className="logo-con">
            <Link to="/hone">
              <h4>Find</h4>
              <h4>Friend</h4>
            </Link>
          </div>
          <ul className={click ? "menu active" : "menu"}>
            <li className="menu-link" onClick={closeMobileMenu}>
              <IoSearch />
              <Link to="/community">Community</Link>
            </li>
            <li className="menu-link" onClick={closeMobileMenu}>
              <BsPinAngle />
              <Link to="/buildCom">Build Community</Link>
            </li>
            <li className="menu-link" onClick={closeMobileMenu}>
              <BsChatText />
              <Link to="/chat">Chat</Link>
            </li>
            <li className="menu-link" onClick={closeMobileMenu}>
              <CgProfile />
              <Link to="/profile">Profile</Link>
            </li>
            <li className="menu-link" onClick={closeMobileMenu}>
              <AiOutlineGlobal />
              <Link to="/newrelease">New Release</Link>
            </li>
            <li className="menu-link" onClick={closeMobileMenu}>
              <IoSettingsOutline />
              <Link to="/setup">Setup</Link>
            </li>
            <li className="menu-link" onClick={closeMobileMenu}>
              <Link to="/login">LOGIN</Link>
            </li>
          </ul>
          <div className="mobile-menu" onClick={handleClick}>
            {click ? <FiX /> : <FiMenu />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Navbar;
