import React from "react";
import "./App.css";
import Navbar from "./Navbar";
import Profile from "./Home/Profile";
import Food from "./Home/Food";
import LoginForm from "./Log/LoginForm";
import Community from "./Home/community";
import Home from "./Home/Home";
import { Route, Routes } from "react-router-dom";
import ForgotPassword from "./Log/ForgotForm";

function App () {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/hone" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/food" element={<Food />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/community" element={<Community />} />
      </Routes>
    </>
  )
}

export default App;
