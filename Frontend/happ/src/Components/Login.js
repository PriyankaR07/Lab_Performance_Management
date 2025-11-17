import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/Login.css";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

import background1 from "../assets/background1.jpg";
import background2 from "../assets/background2.jpg";
import background3 from "../assets/background3.jpg";
import collegeLogo from "../assets/college-logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const backgrounds = [background1, background2, background3];
    const intervalId = setInterval(() => {
      setBackgroundIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required!");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/login", { email, password });
      const { accessToken, role } = response.data;
      localStorage.setItem("token", accessToken);
      const roleToRoute = {
        admin: "/admin-dashboard",
        faculty: "/faculty-dashboard",
        student: "/student-dashboard",
        hod: "/hod-dashboard",
      };
      navigate(roleToRoute[role] || "/");
    } catch (error) {
      setError(error.response?.status === 401 ? "Invalid credentials. Please try again!" : "An error occurred. Please try later!");
    }
  };

  return (
    <div className="login-page-container" style={{ backgroundImage: `url(${[background1, background2, background3][backgroundIndex]})` }}>
      <header className="login-page-header">
        <div className="login-page-header-container">
          <div className="login-page-header-content">
            <img src={collegeLogo} alt="College Logo" className="login-page-college-logo" />
            <div className="login-page-college-title-container">
              <h1>Jyoti Nivas College Autonomous</h1>
              <p>A Premier Institute for Women | Estd. 1966 | Reaccredited by NAAC with ‘A+’ Grade in the 4th Cycle</p>
            </div>
          </div>
          <span className="login-page-evaluation-text">LAB PERFORMANCE SYSTEM</span>
        </div>
      </header>

      <div className="login-page-card">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="login-page-input-box">
            <FaUser className="login-page-input-icon" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="login-page-input-field" required />
          </div>
          <div className="login-page-input-box">
            <FaLock className="login-page-input-icon" />
            <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="login-page-input-field" required />
            <button type="button" className="login-page-eye-button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button type="submit" className="login-page-button">Login</button>
          {error && <p className="login-page-error-message">{error}</p>}
        </form>
      </div>

      <footer className="login-page-footer">
        &copy; 2024 Jyoti Nivas College Autonomous. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
