import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useSignup } from "../../context/SignupContext";
import "./SignUp.css";
import eyeIcon from "../../assets/eye.png";
import hiddenIcon from "../../assets/hidden.png";
import BackButton from "../../components/BackButton";
import apiService from "../../api/apiService"; // API Service 사용

export default function PasswordInput() {
  const navigate = useNavigate();
  const { form } = useSignup();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isFilled = password.trim() !== "" && confirmPassword.trim() !== "";

  const handleNext = async () => {
    if (!isFilled) return;

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setIsLoading(true);
      
      // API Service를 통한 회원가입
      const response = await apiService.auth.signup({
        username: form.username,
        nickname: form.nickname,
        password: password,
      });

      console.log("회원가입 성공:", response);
      navigate("/signup/complete");

    } catch (error) {
      console.error("회원가입 요청 실패:", error);
      
      // 에러 메시지 처리
      let errorMessage = "회원가입에 실패했습니다.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-header">
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
          disabled={isLoading}
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
          disabled={isLoading}
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
        disabled={!isFilled || isLoading}
        onClick={handleNext}
      >
        {isLoading ? "가입 중..." : "다음"}
      </button>
    </div>
  );
}