import React from "react";
import "./App.css";
import Navbar from "./Navbar";
import Profile from "./Home/Profile";
import Freind from "./Home/friend";
import LoginForm from "./Log/NewLogin";
import Community from "./Home/Newcommu";
import Setup from "./Home/setup";
import Home from "./Home/Home";
import { Route, Routes, useLocation } from "react-router-dom";
// import ForgotPassword from "./Log/ForgotForm";

function App() {
  const location = useLocation(); // ใช้เพื่อดึงข้อมูล path ปัจจุบัน

  return (
    <>
      {/* หากไม่ใช่หน้า login, จะแสดง Navbar */}
      {location.pathname !== "/login" && <Navbar />}

      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/friend" element={<Freind />} />
        <Route path="/setup" element={<Setup />} />

        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/community" element={<Community />} />
      </Routes>
    </>
  );
}

export default App;
