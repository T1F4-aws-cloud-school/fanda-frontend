import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useSignup } from "../../context/SignupContext";
import BackButton from "../../components/BackButton";
import "./SignUp.css";

export default function NameIdInput() {
  const navigate = useNavigate();
  const { setForm } = useSignup();

  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");

  const isFilled = nickname.trim() && username.trim();

  const handleNext = () => {
    if (!isFilled) return;

    // Context에만 저장
    setForm(prev => ({ ...prev, username, nickname }));

    // 비밀번호 입력으로 이동
    navigate("/signup/password");
  };

  return (
    <div className="signup-container">
      <div className="signup-header">
        <BackButton to="/signup" />
      </div>

      <h2 className="title">이름, 아이디를{'\n'}입력해 주세요</h2>

      <input
        className="input-field"
        type="text"
        placeholder="이름 입력"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <input
        className="input-field"
        type="text"
        placeholder="아이디 입력"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
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