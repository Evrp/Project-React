import React, { useState, useEffect } from "react";
import { auth, provider, signInWithPopup } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./NewLogin.css";

const NewLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // 👉 handle animation switching
  useEffect(() => {
    const container = document.getElementById("container");
    const registerButton = document.getElementById("register");
    const loginButton = document.getElementById("login");

    if (registerButton && loginButton && container) {
      registerButton.addEventListener("click", () => {
        container.classList.add("active");
      });

      loginButton.addEventListener("click", () => {
        container.classList.remove("active");
      });
    }

    return () => {
      if (registerButton && loginButton && container) {
        registerButton.removeEventListener("click", () => {});
        loginButton.removeEventListener("click", () => {});
      }
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // ส่งข้อมูลผู้ใช้ไปยัง backend (MongoDB)
      const response = await axios.post("http://localhost:8080/api/login", {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });

      console.log("Response from backend:", response.data);

      // เก็บข้อมูลลง localStorage
      localStorage.setItem("userName", user.displayName);
      localStorage.setItem("userPhoto", user.photoURL);
      localStorage.setItem("userEmail", user.email); // ✅ เพิ่มบรรทัดนี้

      // ไปหน้า /home
      navigate("/home");
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการล็อกอิน");
      console.error(error);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" id="container">
        {/* Sign In Form */}
        <div className="form-container sign-in">
          <form>
            <h1>Sign In</h1>
            <div className="social-icons">
              <a href="#" className="icon" onClick={handleGoogleSignIn}>
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
            </div>
            <span>or use your email password</span>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <a href="#">Forget Your Password?</a>
            <button type="button" className="google-btn">
              Sign In
            </button>
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>

        {/* Sign Up Form */}
        <div className="form-container sign-up">
          <form>
            <h1>Create Account</h1>
            <div className="social-icons">
              <a href="#" className="icon">
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
            </div>
            <span>or use your email to register</span>
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button type="button">Sign Up</button>
          </form>
        </div>

        {/* Toggle Panel */}
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
