import React from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";
import pandaImg from "../assets/fanda.png"; 

export default function SignUpComplete() {
  const navigate = useNavigate();

  return (
    <div className="complete-container" style={{ textAlign: "center" }}>
      <img src={pandaImg} alt="팬더" style={{ width: "120px", margin: "180px auto 30px" }} />
      <h2 style={{ marginBottom: "10px" }}>가입을 환영해요</h2>
      <p style={{ color: "#888", marginBottom: "50px" }}>
        이제부터 세끼통살을 즐겨보세요!
      </p>
      <button
        className="next-button"
        onClick={() => navigate("/")}
      >
        시작하기
      </button>
    </div>
  );
}
