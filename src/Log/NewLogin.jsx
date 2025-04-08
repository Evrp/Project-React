import React, { useState } from "react";
import { auth, provider, signInWithPopup } from "../firebase/firebase"; // นำเข้าจาก firebase.js
import { useNavigate } from "react-router-dom";
import "./NewLogin.css"; // ใส่ไฟล์ CSS สำหรับ UI

const NewLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // ฟังก์ชันสำหรับการลงชื่อเข้าใช้ผ่าน Google
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // เก็บชื่อและรูปโปรไฟล์ไว้ใน localStorage
      localStorage.setItem("userName", user.displayName);
      localStorage.setItem("userPhoto", user.photoURL);

      navigate("/home"); // หรือ "/profile"
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการล็อกอิน");
      console.error(error);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" id="container">
        <div className="form-container sign-in">
          <form>
            <h1>Sign In</h1>
            <div className="social-icons">
              <a href="#" className="icon" onClick={handleGoogleSignIn}>
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <span>or use your email password</span>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <a href="#">Forget Your Password?</a>
            <button
              type="button"
              
              className="google-btn"
            >
              Sign In
            </button>{" "}
            {/* ปุ่ม Sign In with Google */}
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>

        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome to FindFriend</h1>
              <p>Enter your personal details to use all of site features</p>
              <button className="hidden" id="login">
                Sign In
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello, Friend!</h1>
              <p>
                Register with your personal details to use all of site features
              </p>
              <button className="hidden" id="register">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLogin;
