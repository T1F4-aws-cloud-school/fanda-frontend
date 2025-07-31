"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Login.css"

export default function LoginScreen() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const isFormValid = username.trim() !== "" && password.trim() !== ""

  const handleLogin = async () => {
    console.log("로그인 시도:", { username, password })
    
    // API 호출
    try {
      const response = await fetch("http://localhost:4000/api/v1/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const data = await response.json()
      console.log("로그인 응답: ", data)

      if (response.ok && data.content?.accessToken) {
        // 로그인 성공, 토큰 저장
        localStorage.setItem("accessToken", data.content.accessToken)
        localStorage.setItem("refreshToken", data.content.refreshToken)
        console.log("로그인 성공")

        // 로그인 후 메인 화면으로 이동
        navigate("/main")
      } else {
        // 로그인 실패
        alert(`로그인 실패: ${data.message || "아이디/비밀번호를 확인하세요"}`)
      }
    } catch (error) {
      console.error("로그인 오류:", error)
      alert("로그인 중 오류 발생")
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
        <h1 className="app-title">세 끼 통 살</h1>

        {/* 입력 필드 */}
        <div className="input-container">
          <input
            type="text"
            placeholder="ID 입력"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
