// src/pages/Login.jsx
import React, { useEffect } from "react";
import { auth, provider } from "../../firebase/firebasetest";
import { signInWithRedirect, getRedirectResult } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          const user = result.user;
          console.log("✅ Login success:", user);

          // เก็บข้อมูล user ลง localStorage
          localStorage.setItem("userName", user.displayName);
          localStorage.setItem("userEmail", user.email);
          localStorage.setItem("userPhoto", user.photoURL);

          // ไปหน้า home
          navigate("/home");
        }
      })
      .catch((error) => {
        console.error("❌ Login error:", error);
      });
  }, []);

  const handleLogin = () => {
    signInWithRedirect(auth, provider);
  };

  return (
    <div className="login-container">
      <h2>เข้าสู่ระบบด้วย Google</h2>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
};

export default Login;
