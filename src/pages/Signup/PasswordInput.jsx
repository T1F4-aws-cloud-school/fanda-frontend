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
      
      // API 명세에 따른 응답 체크
      // 응답: { "id": 1, "username": "fanda123", "nickname": "다팬다" }
      if (response && response.id && response.username) {
        navigate("/signup/complete");
      } else {
        throw new Error("회원가입 응답이 올바르지 않습니다.");
      }

    } catch (error) {
      console.error("회원가입 요청 실패:", error);
      
      // 에러 메시지 처리
      let errorMessage = "회원가입에 실패했습니다.";
      
      // 백엔드 에러 응답 처리
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        // 일반적인 에러 메시지가 있는 경우
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : "서버에서 오류가 발생했습니다.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // 네트워크 에러나 서버 연결 실패
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorMessage = "서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.";
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