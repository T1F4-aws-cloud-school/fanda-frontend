import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import BackButton from "../../components/BackButton";
import apiService from "../../api/apiService";
import "./Manager.css";

export default function Manager() {
  const navigate = useNavigate();
  
  const [productId, setProductId] = useState("4"); // 기본값: 허브맛 수비드 닭가슴살
  const [startDate, setStartDate] = useState("2025-07-01");
  const [endDate, setEndDate] = useState("2025-08-13");
  const [isLoading, setIsLoading] = useState(false);

  const handleStartCollection = async () => {
    try {
      setIsLoading(true);
      
      // 입력값 검증
      if (!productId || !startDate || !endDate) {
        alert("모든 필드를 입력해주세요.");
        return;
      }

      if (new Date(startDate) > new Date(endDate)) {
        alert("시작 날짜가 종료 날짜보다 늦을 수 없습니다.");
        return;
      }

      console.log("리뷰 수집 시작:", {
        productId: parseInt(productId),
        startDate,
        endDate
      });

      // 새로운 API 엔드포인트 사용
      const result = await apiService.admin.collectReviewsByPeriod(
        parseInt(productId), 
        startDate, 
        endDate
      );
      
      console.log("리뷰 수집 성공:", result);
      
      // 결과 페이지로 이동 (항상 이동)
      navigate("/admin/review-result", { 
        state: { resultData: result } 
      });

    } catch (error) {
      console.error("리뷰 수집 실패:", error);
      
      // 에러 메시지 처리
      let errorMessage = "리뷰 수집에 실패했습니다.";
      
      if (error.response?.status === 401) {
        errorMessage = "관리자 권한이 필요합니다. 로그인을 확인해주세요.";
      } else if (error.response?.status === 404) {
        errorMessage = "해당 상품을 찾을 수 없습니다.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 폼 유효성 검사
  const isFormValid = productId && startDate && endDate && !isLoading;

  return (
    <div className="manager-container">
      <div className="manager-header">
        <BackButton to="/" />
      </div>

      <h2 className="manager-title">
        제품 개선 이후의{'\n'}리뷰 데이터를 수집하여,{'\n'}개선 전후를 비교한{'\n'}분석 보고서를 생성합니다.
      </h2>

      {/* 상품 ID 입력 카드 */}
      <div className="white-card">
        <div className="product-name-container">
          <span className="product-name-label">상품 ID</span>
          <input
            type="number"
            className="product-name-input"
            placeholder="상품 ID를 입력하세요"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            disabled={isLoading}
            min="1"
          />
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#6e6e6e', 
          marginTop: '8px',
          lineHeight: '1.4'
        }}>
          * 예시: 4 (허브맛 수비드 닭가슴살)<br/>
          * 상품 상세 페이지 URL에서 확인할 수 있습니다
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
          disabled={isLoading}
          max={endDate} // 종료 날짜보다 늦을 수 없음
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
          disabled={isLoading}
          min={startDate} // 시작 날짜보다 빠를 수 없음
        />
      </div>

      <button
        className={`start-button ${!isFormValid ? 'disabled' : ''}`}
        onClick={handleStartCollection}
        disabled={!isFormValid}
      >
        {isLoading ? "수집 중..." : "리뷰 데이터 수집 시작"}
      </button>
    </div>
  );
}