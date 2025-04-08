import React from "react";
import "./App.css";
import Navbar from "./Navbar";
import Profile from "./Home/Profile";
import LoginForm from "./Log/NewLogin";
import Community from "./Home/Newcommu";
import Home from "./Home/Newcommu";
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
        <Route path="/login" element={<LoginForm />} />

        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/community" element={<Community />} />
      </Routes>
    </>
  );
}

export default App;
