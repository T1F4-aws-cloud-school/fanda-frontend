import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./SignUp.css";
import eyeIcon from "../assets/eye.png";
import hiddenIcon from "../assets/hidden.png";

export default function PasswordInput() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const isFilled = password.trim() !== "" && confirmPassword.trim() !== "";

  return (
    <div className="signup-container">
      <div className="signup-header">
        <button className="back-button" onClick={() => navigate("/signup/name")}>
          &lt;
        </button>
      </div>

      <h2 className="title">비밀번호를{'\n'}입력해 주세요</h2>

      {/* 비밀번호 입력 */}
      <div className="input-wrapper">
        <input
          className="input-field"
          type={showPassword ? "text" : "password"}
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <img
          src={showPassword ? eyeIcon : hiddenIcon}
          alt="toggle visibility"
          className="eye-icon"
          onClick={() => setShowPassword(!showPassword)}
        />
      </div>

      {/* 비밀번호 확인 */}
      <div className="input-wrapper">
        <input
          className="input-field"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <img
          src={showConfirmPassword ? eyeIcon : hiddenIcon}
          alt="toggle visibility"
          className="eye-icon"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        />
      </div>

      <button
        className="next-button"
        disabled={!isFilled}
        onClick={() => {
            if (isFilled) {
            navigate("/signup/complete");
            }
        }}
      >
        다음
      </button>
    </div>
  );
}