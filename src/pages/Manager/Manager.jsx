import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import BackButton from "../../components/BackButton";
import "./Manager.css";

export default function Manager() {
  const navigate = useNavigate();
  
  const [productName, setProductName] = useState("");
  const [startDate, setStartDate] = useState("2024-08-25");
  const [endDate, setEndDate] = useState("2024-08-25");

  const handleStartCollection = async () => {
    try {
      // 리뷰 데이터 수집 및 보고서 생성 API 호출
      const response = await fetch('/api/v1/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          productName: productName,
          startDate: startDate,
          endDate: endDate
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log("보고서 생성 성공:", result);
        alert("보고서가 성공적으로 생성되었습니다!");
        // 보고서 페이지로 이동하거나 결과 표시
        // navigate('/report', { state: { reportData: result } });
      } else {
        console.error("보고서 생성 실패:", result);
        alert("보고서 생성에 실패했습니다: " + result.message);
      }
    } catch (error) {
      console.error("API 호출 오류:", error);
      alert("서버 연결에 실패했습니다.");
    }
  };

  return (
    <div className="manager-container">
      <div className="manager-header">
        <BackButton to="/" />
      </div>

      <h2 className="manager-title">
        제품 개선 이후의{'\n'}리뷰 데이터를 수집하여,{'\n'}개선 전후를 비교한{'\n'}분석 보고서를 생성합니다.
      </h2>

      {/* 상품 이름 입력 카드 */}
      <div className="white-card">
        <div className="product-name-container">
          <span className="product-name-label">상품 이름</span>
          <input
            type="text"
            className="product-name-input"
            placeholder="상품 이름을 입력하세요"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
      </div>

      {/* 리뷰 데이터 수집 시작 날짜 카드 */}
      <div className="white-card">
        <div className="card-title">리뷰 데이터 수집 시작 날짜</div>
        <input
          type="date"
          className="date-picker"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      {/* 리뷰 데이터 수집 종료 날짜 카드 */}
      <div className="white-card">
        <div className="card-title">리뷰 데이터 수집 종료 날짜</div>
        <input
          type="date"
          className="date-picker"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <button
        className="start-button"
        onClick={handleStartCollection}
      >
        리뷰 데이터 수집 시작
      </button>
    </div>
  );
}