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

  const handleNext = async () => {
    if (!isFilled) return;

    // 비밀번호 일치 여부 확인
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/signup/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        navigate("/signup/complete");
      } else {
        const data = await response.json();
        console.warn("비밀번호 저장 실패:", data.message);
        navigate("/signup/complete"); // 실패해도 넘어가게 처리
      }
    } catch (err) {
      console.warn("API 실패, 목업모드 이동");
      navigate("/signup/complete"); // API 안되면 그냥 다음 화면
    }
  };

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
        onClick={handleNext}
      >
        다음
      </button>
    </div>
  );
}
