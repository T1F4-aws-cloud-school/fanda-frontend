import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./SignUp.css";

export default function NameIdInput() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  const isFilled = name.trim() !== "" && userId.trim() !== "";

  const handleNext = async () => {
    if (!isFilled) return;

    try {
      // 실제 API 호출
      const response = await fetch("http://localhost:4000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, userId }),
      });

      if (response.ok) {
        // 회원가입 성공 → 다음 페이지
        navigate("/signup/password");
      } else {
        // 실패 시에도 그냥 넘어가되 콘솔에는 표시
        const data = await response.json();
        console.warn("회원가입 실패:", data.message);
        navigate("/signup/password");
      }
    } catch (err) {
      // 서버가 꺼져있거나 API 없는 경우  그냥 넘어가기
      console.warn("API 연결 실패, 목업 모드로 이동");
      navigate("/signup/password");
    }
  };

  return (
    <div className="signup-container">
      <div className="header">
        <button className="back-button" onClick={() => navigate("/signup")}>
          &lt;
        </button>
      </div>

      <h2 className="title">이름과 아이디를{'\n'}입력해 주세요</h2>

      <input
        className="input-field"
        type="text"
        placeholder="이름 입력"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="input-field"
        type="text"
        placeholder="아이디 입력"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />

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
