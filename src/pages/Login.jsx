"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Login.css"
import apiService from "../api/apiService"
import { useAuth } from "../context/AuthContext"

export default function LoginScreen() {
  const navigate = useNavigate()
  const { handleLoginSuccess } = useAuth() 
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const isFormValid = username.trim() !== "" && password.trim() !== ""

  const handleLogin = async () => {
    if (!isFormValid) return;
    
    try {
      setIsLoading(true);
      console.log("로그인 시도:", { username, password })
      
      // API Service를 통한 로그인
      const response = await apiService.auth.login({
        username,
        password,
      });

      console.log("로그인 응답:", response);

      // 백엔드 응답 구조
      if (response.statusCode === "OK" && response.content?.accessToken) {
        // 토큰 저장
        localStorage.setItem("accessToken", response.content.accessToken);
        localStorage.setItem("refreshToken", response.content.refreshToken);
        
        console.log("로그인 성공");

        handleLoginSuccess();
        // 로그인 후 메인 화면으로 이동
        navigate("/");
      } else {
        // 로그인 실패
        throw new Error(response.message || "로그인에 실패했습니다");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      
      // 에러 메시지 처리
      let errorMessage = "로그인에 실패했습니다.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSignUp = () => {
    console.log("회원가입 페이지로 이동")
    navigate("/signup")
  }

  return (
    <div className="mobile-app">
      <div className="main-content">
        {/* 제목 */}
        <h1 className="login-app-title">세 끼 통 살</h1>

        {/* 입력 필드 */}
        <div className="input-container">
          <input
            type="text"
            placeholder="ID 입력"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            disabled={isLoading}
          />

          <input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            disabled={isLoading}
          />
        </div>

        {/* 로그인 버튼 */}
        <button 
          onClick={handleLogin}
          disabled={!isFormValid || isLoading}
          className={`login-button ${(!isFormValid || isLoading) ? 'disabled' : ''}`}
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </button>

        {/* 회원가입 링크 */}
        <button onClick={handleSignUp} className="signup-link" disabled={isLoading}>
          회원 가입
        </button>
      </div>
    </div>
  )
}