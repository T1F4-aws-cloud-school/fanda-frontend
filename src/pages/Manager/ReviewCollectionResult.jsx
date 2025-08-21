import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import "./ReviewCollectionResult.css";

export default function ReviewCollectionResult() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Manager.jsx에서 전달받은 결과 데이터
  const resultData = location.state?.resultData;

  if (!resultData) {
    return (
      <div className="result-container">
        <div className="result-header">
          <BackButton to="/manager" />
        </div>
        <div className="error-content">
          <h2>결과 데이터를 찾을 수 없습니다</h2>
          <p>관리자 페이지에서 다시 시도해주세요.</p>
          <button 
            className="action-button"
            onClick={() => navigate("/manager")}
          >
            관리자 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleViewProduct = () => {
    navigate(`/detail/${resultData.productId}`);
  };

  const handleBackToManager = () => {
    navigate("/manager");
  };

  return (
    <div className="result-container">
      <div className="result-header">
        <BackButton to="/manager" />
      </div>

      <div className="result-content">
        <div className="success-icon">
          ✅
        </div>
        
        <h2 className="result-title">
          리뷰 수집이{'\n'}완료되었습니다!
        </h2>

        {/* 결과 카드 */}
        <div className="result-card">
          <div className="result-item">
            <span className="result-label">상품 ID</span>
            <span className="result-value">{resultData.productId}</span>
          </div>
          
          <div className="result-item">
            <span className="result-label">수집 기간</span>
            <span className="result-value">
              {resultData.startAt} ~ {resultData.endAt}
            </span>
          </div>
          
          <div className="result-item highlight">
            <span className="result-label">새로 수집된 리뷰</span>
            <span className="result-value-highlight">
              {resultData.savedCount}개
            </span>
          </div>
        </div>

        {/* 상태 메시지 */}
        <div className="status-message">
          {resultData.savedCount > 0 ? (
            <div className="success-message">
              <p>🎉 {resultData.savedCount}개의 새로운 리뷰가 수집되었습니다!</p>
              <p>상품 상세 페이지에서 확인해보세요.</p>
            </div>
          ) : (
            <div className="info-message">
              <p>ℹ️ 해당 기간에 새로 수집된 리뷰가 없습니다.</p>
              <p>이미 모든 리뷰가 수집되었거나, 해당 기간에 작성된 리뷰가 없을 수 있습니다.</p>
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div className="action-buttons">
          <button 
            className="action-button secondary"
            onClick={handleBackToManager}
          >
            다시 수집하기
          </button>
          
          <button 
            className="action-button primary"
            onClick={handleViewProduct}
          >
            상품 상세 보기
          </button>
        </div>
      </div>
    </div>
  );
}