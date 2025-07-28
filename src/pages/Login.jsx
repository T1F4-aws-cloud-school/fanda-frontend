"use client"

import { useState } from "react"
import "./Login.css"
import { useNavigate } from "react-router-dom"

export default function LoginScreen() {
  const navigate = useNavigate();
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  
  const isFormValid = id.trim() !== "" && password.trim() !== ""
  
  
  const handleLogin = () => {
    console.log("로그인 시도:", { id, password })
    // 로그인 로직
  }

  const handleSignUp = () => {
    console.log("회원가입 페이지로 이동")
    navigate("/signup")
  }

  return (
    <div className="mobile-app">
      <div className="main-content">
        {/* 제목 */}
        <h1 className="app-title">세 끼 통 살</h1>

        {/* 입력 필드 */}
        <div className="input-container">
          <input
            type="id"
            placeholder="ID 입력"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="input-field"
          />

          <input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </div>

        {/* 로그인 버튼 */}
        <button 
          onClick={handleLogin}
          disabled={!isFormValid} // 유효성 검사로 버튼 활성화 제어
          className="login-button">
          로그인
        </button>

        {/* 회원가입 링크 */}
        <button onClick={handleSignUp} className="signup-link">
          회원 가입
        </button>
      </div>
    </div>
  )
}
