"use client"

import { useState } from "react"
import "./Login.css"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {
    console.log("로그인 시도:", { email, password })
    // 로그인 로직
  }

  const handleSignUp = () => {
    console.log("회원가입 페이지로 이동")
    // 회원가입 페이지 이동 로직
  }

  return (
    <div className="mobile-app">
      <div className="main-content">
        {/* 제목 */}
        <h1 className="app-title">세 끼 통 살</h1>

        {/* 입력 필드 */}
        <div className="input-container">
          <input
            type="email"
            placeholder="ID 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <button onClick={handleLogin} className="login-button">
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
