import React from "react";
import "./App.css";
import Navbar from "./Navbar";
import Profile from "./components/profile/Profile";
import Freind from "./components/freind/friend";
import LoginForm from "./Log/NewLogin";
import Community from "./components/community/community";
import Setup from "./components/setting/setup";
import Home from "./components/Home/Home";
import Chat from "./components/chat/chat";
import ChatContainerAI from "./components/chat/ChatContainerAI";
import { Route, Routes, useLocation } from "react-router-dom";
import { NotificationProvider } from "./context/notificationContext";
import { SocketProvider } from "./context/socketcontext";
// import ForgotPassword from "./Log/ForgotForm";

function App() {
  const location = useLocation(); // ใช้เพื่อดึงข้อมูล path ปัจจุบัน

  return (
    <SocketProvider>
      <NotificationProvider>
        {/* หากไม่ใช่หน้า login, จะแสดง Navbar */}
        {location.pathname !== "/login" && <Navbar />}

        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/friend" element={<Freind />} />
          <Route path="/setup" element={<Setup />} />
          {/* <Route path="/chat" element={<Chat />} /> */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/community" element={<Community />} />
          <Route path="/chat/:roomId" element={<Chat />} />
          <Route path="/ai-chat" element={<ChatContainerAI />} />
        </Routes>
      </NotificationProvider>
    </SocketProvider>
  );
}

export default App;
