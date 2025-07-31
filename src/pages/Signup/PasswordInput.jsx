import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useSignup } from "../../context/SignupContext";
import "./SignUp.css";
import eyeIcon from "../../assets/eye.png";
import hiddenIcon from "../../assets/hidden.png";
import BackButton from "../../components/BackButton";

export default function PasswordInput() {
  const navigate = useNavigate();
  const { form } = useSignup();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isFilled = password.trim() !== "" && confirmPassword.trim() !== "";

  const handleNext = async () => {
    if (!isFilled) return;

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/v1/user/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          nickname: form.nickname,
          password: password,
        }),
      });

      const data = await response.json(); // 한 번만 호출

      if (response.ok) {
        console.log("회원가입 성공:", data);
        navigate("/signup/complete");
      } else {
        console.warn("회원가입 실패:", data.message);
        alert(`회원가입 실패: ${data.message || "다시 시도해주세요."}`);
      }
    } catch (err) {
      console.error("회원가입 요청 실패:", err);
      alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className="signup-container">
      <div className="header">
        <BackButton to="/signup/name" />
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
