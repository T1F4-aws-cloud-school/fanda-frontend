import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./SignUp.css";

export default function NameIdInput() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");

  const isFilled = name.trim() !== "" && userId.trim() !== "";

  return (
    <div className="signup-container">
      <div className="signup-header">
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
        onClick={() => {
            if (isFilled) {
            navigate("/signup/password"); 
            }
        }}
      >
        다음
      </button>
    </div>
  );
}
